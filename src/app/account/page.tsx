"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import type { NavbarUser } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Bell,
  Camera,
  ChevronRight,
  Loader2,
  Lock,
  LogOut,
  Package,
  Pencil,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

const PREFS_KEY = "emperors-account-prefs-v1";
const ACCOUNT_DRAFT_KEY_PREFIX = "emperors-account-draft-v1:";
const ACCENT = "#46A3D3";
const SIDEBAR_BG = "#F0F2F5";

type Section = "settings" | "personal" | "privacy" | "notifications";

type StoredPrefs = {
  bio: string;
  timezone: string;
  privacyReceiptEmail: boolean;
  privacyAnalytics: boolean;
  notifyOrderEmail: boolean;
  notifyMarketing: boolean;
};

const defaultPrefs = (): StoredPrefs => ({
  bio: "",
  timezone: "",
  privacyReceiptEmail: true,
  privacyAnalytics: false,
  notifyOrderEmail: true,
  notifyMarketing: false,
});

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

function splitName(full: string) {
  const t = full.trim();
  if (!t) return { first: "", last: "" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function usernameFromEmail(email: string) {
  const i = email.indexOf("@");
  return i > 0 ? email.slice(0, i) : email;
}

type LocalAccountDraft = {
  firstName: string;
  lastName: string;
  phone: string;
};

function readLocalAccountDraft(email: string): LocalAccountDraft | null {
  try {
    const raw = localStorage.getItem(`${ACCOUNT_DRAFT_KEY_PREFIX}${email.toLowerCase()}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalAccountDraft>;
    return {
      firstName: (parsed.firstName ?? "").trim(),
      lastName: (parsed.lastName ?? "").trim(),
      phone: (parsed.phone ?? "").trim(),
    };
  } catch {
    return null;
  }
}

function writeLocalAccountDraft(email: string, draft: LocalAccountDraft) {
  try {
    localStorage.setItem(
      `${ACCOUNT_DRAFT_KEY_PREFIX}${email.toLowerCase()}`,
      JSON.stringify(draft),
    );
  } catch {
    /* ignore */
  }
}

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("settings");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [prefs, setPrefs] = useState<StoredPrefs>(defaultPrefs);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const isLocal = user?.provider === "local";

  const reloadUser = useCallback(() => {
    return fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user: NavbarUser | null }) => {
        const u = data.user ?? null;
        setUser(u);
        if (u) {
          const draft = readLocalAccountDraft(u.email);
          const sourceName = u.provider === "google" && draft
            ? [draft.firstName, draft.lastName].filter(Boolean).join(" ").trim() || u.name
            : u.name;
          const { first, last } = splitName(sourceName || "");
          setFirstName(first);
          setLastName(last);
          setPhone(u.provider === "google" && draft ? draft.phone : (u.phone?.trim() ?? ""));
        }
        return u;
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    reloadUser().finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [reloadUser]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<StoredPrefs>;
        setPrefs({ ...defaultPrefs(), ...p });
      }
    } catch {
      /* ignore */
    }
    setPrefsLoaded(true);
  }, []);

  const savePrefs = useCallback((next: StoredPrefs) => {
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/local-signout", { method: "POST" });
      await nextAuthSignOut({ redirect: false });
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  const handleSaveAccount = async () => {
    if (!user) return;
    if (!isLocal) {
      const nextName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ").trim() || user.name;
      const nextPhone = phone.trim();
      writeLocalAccountDraft(user.email, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: nextPhone,
      });
      setUser({ ...user, name: nextName, phone: nextPhone });
      toast({
        title: "Saved",
        description: "Profile details were saved for this browser.",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "google_account") {
          toast({
            title: "Google account",
            description: data.message ||
              "Name and email are managed by Google. Update your phone at checkout.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.message || "Could not save");
      }
      if (data.user) {
        setUser(data.user);
        toast({ title: "Saved", description: "Your account details were updated." });
        router.refresh();
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: e instanceof Error ? e.message : "Try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const navItems = useMemo(
    () =>
      [
        { id: "settings" as const, label: "Account settings", icon: Settings },
        { id: "personal" as const, label: "Personal information", icon: User },
        { id: "privacy" as const, label: "Privacy", icon: Lock },
        { id: "notifications" as const, label: "Notifications", icon: Bell },
      ] as const,
    [],
  );

  const sectionTitle = useMemo(() => {
    const m: Record<Section, string> = {
      settings: "Account settings",
      personal: "Personal information",
      privacy: "Privacy",
      notifications: "Notification preferences",
    };
    return m[section];
  }, [section]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 md:pt-8">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: ACCENT }} />
            <span className="font-medium">Loading your account…</span>
          </div>
        ) : !user ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
            <h1 className="font-headline text-2xl font-bold">You&apos;re not signed in</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to manage your profile and preferences.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="rounded-full font-semibold" style={{ backgroundColor: ACCENT }}>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/signup">Create an account</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 md:flex-row md:gap-0 md:rounded-2xl md:border md:border-border/50 md:bg-card md:shadow-sm md:overflow-hidden">
            {/* Mobile: profile strip + section picker */}
            <div className="space-y-4 md:hidden">
              <div
                className="flex items-center gap-4 rounded-2xl border border-border/60 p-4 shadow-sm"
                style={{ backgroundColor: SIDEBAR_BG }}
              >
                <Avatar className="h-14 w-14 border-2 border-white shadow">
                  {user.image ? <AvatarImage src={user.image} alt="" className="object-cover" /> : null}
                  <AvatarFallback
                    className="text-sm font-headline font-bold text-white"
                    style={{ background: `linear-gradient(160deg, #6bc4e8, ${ACCENT})` }}
                  >
                    {initialsFromName(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-headline font-semibold">{user.name || "Member"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Select value={section} onValueChange={(v) => setSection(v as Section)}>
                <SelectTrigger className="h-12 rounded-xl border-border/80 bg-muted/30 font-headline">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {navItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Inner sidebar */}
            <aside
              className="hidden w-[280px] shrink-0 flex-col border-r border-border/60 md:flex"
              style={{ backgroundColor: SIDEBAR_BG }}
            >
              <div className="flex flex-col items-center px-6 pb-4 pt-8">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-md ring-2 ring-black/5">
                    {user.image ? <AvatarImage src={user.image} alt="" className="object-cover" /> : null}
                    <AvatarFallback
                      className="text-2xl font-headline font-bold text-white"
                      style={{ background: `linear-gradient(160deg, #6bc4e8, ${ACCENT})` }}
                    >
                      {initialsFromName(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white shadow-md transition hover:scale-105"
                    style={{ color: ACCENT }}
                    title="Profile photo is managed by your sign-in provider"
                    onClick={() =>
                      toast({
                        title: "Profile photo",
                        description:
                          user.provider === "google"
                            ? "Update your Google profile picture to change it here."
                            : "Avatar initials are shown for email accounts.",
                      })
                    }
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-center font-headline text-lg font-semibold text-foreground">
                  {user.name || "Member"}
                </p>
                <p className="mt-0.5 truncate text-center text-sm text-muted-foreground">{user.email}</p>
              </div>

              <nav className="flex flex-col gap-1 px-3 pb-4">
                {navItems.map((item) => {
                  const active = section === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSection(item.id)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-lg py-2.5 pl-4 pr-3 text-left text-sm transition-colors",
                        active
                          ? "font-semibold"
                          : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground",
                      )}
                      style={active ? { color: ACCENT, backgroundColor: "rgba(70, 163, 211, 0.08)" } : undefined}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                          style={{ backgroundColor: ACCENT }}
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-border/40 px-4 py-4">
                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="/account/orders">
                    <Package className="h-4 w-4" />
                    Order history
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </Link>
                </Button>
                {user.role === "admin" && (
                  <Button variant="ghost" className="justify-start gap-2 text-muted-foreground" asChild>
                    <Link href="/admin/menu">
                      <Settings className="h-4 w-4" />
                      Admin menu
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-muted-foreground hover:text-destructive"
                  onClick={() => void handleSignOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-h-[60vh] flex-1 bg-[#fafafa] md:bg-white md:px-8 md:py-8">
              <div className="mx-auto max-w-2xl">
                <h1 className="font-headline text-2xl font-bold tracking-tight md:text-3xl">{sectionTitle}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {section === "settings" && "Update how you appear and how we reach you."}
                  {section === "personal" && "Extra details for your experience (stored on this device)."}
                  {section === "privacy" && "Control what we show and optional analytics."}
                  {section === "notifications" && "Choose how we notify you about orders and updates."}
                </p>

                {user.provider === "google" && section === "settings" && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p>
                      <span className="font-semibold text-foreground">Signed in with Google.</span>{" "}
                      Name and email come from Google by default. You can personalize first name, last name,
                      and phone for this browser.
                    </p>
                  </div>
                )}

                {section === "settings" && (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="h-11 rounded-lg border-border/80 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-11 rounded-lg border-border/80 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Username</Label>
                      <div className="relative">
                        <Input
                          readOnly
                          value={usernameFromEmail(user.email)}
                          className="h-11 rounded-lg border-border/80 bg-muted/40 pr-10 text-muted-foreground"
                        />
                        <Pencil className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                      </div>
                      <p className="text-xs text-muted-foreground">Derived from your email address.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          readOnly
                          value={user.email}
                          className="h-11 rounded-lg border-border/80 bg-muted/40 pr-10 text-muted-foreground"
                        />
                        <Pencil className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="h-11 rounded-lg border-border/80 bg-white"
                      />
                      {!isLocal && (
                        <p className="text-xs text-muted-foreground">
                          Add or update phone at checkout, or contact support to change it on file.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="flex flex-wrap items-center gap-3">
                        <Input
                          readOnly
                          type="password"
                          value="••••••••••"
                          className="h-11 max-w-xs rounded-lg border-border/80 bg-muted/40"
                        />
                        {isLocal ? (
                          <Button
                            variant="link"
                            className="px-0 font-semibold"
                            style={{ color: ACCENT }}
                            asChild
                          >
                            <Link href="/forgot-password">Change password</Link>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Managed by Google</span>
                        )}
                      </div>
                      {isLocal && (
                        <p className="text-xs text-muted-foreground">
                          Use forgot password if you signed up with email.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <Button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleSaveAccount()}
                        className="rounded-full px-8 font-semibold text-white shadow-sm"
                        style={{ backgroundColor: ACCENT }}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save changes"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full font-semibold"
                        style={{ color: ACCENT }}
                        onClick={() => void reloadUser()}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {section === "personal" && prefsLoaded && (
                  <div className="mt-8 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio / notes</Label>
                      <Textarea
                        id="bio"
                        rows={5}
                        value={prefs.bio}
                        onChange={(e) => savePrefs({ ...prefs, bio: e.target.value })}
                        placeholder="Tell us your favorite dishes or dietary notes (optional)."
                        className="resize-y rounded-xl border-border/80 bg-white"
                      />
                      <p className="text-xs text-muted-foreground">Stored only in this browser.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred timezone</Label>
                      <Select
                        value={prefs.timezone || "__default__"}
                        onValueChange={(v) =>
                          savePrefs({ ...prefs, timezone: v === "__default__" ? "" : v })
                        }
                      >
                        <SelectTrigger className="h-11 rounded-lg border-border/80 bg-white">
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__default__">(use device default)</SelectItem>
                          <SelectItem value="America/New_York">Eastern (US)</SelectItem>
                          <SelectItem value="America/Chicago">Central (US)</SelectItem>
                          <SelectItem value="America/Denver">Mountain (US)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific (US)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Saved",
                          description: "Personal preferences stored in this browser.",
                        })
                      }
                      className="rounded-full px-8 font-semibold text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Save
                    </Button>
                  </div>
                )}

                {section === "privacy" && prefsLoaded && (
                  <div className="mt-8 space-y-8">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-white px-4 py-4">
                      <div>
                        <p className="font-medium">Show email on receipts</p>
                        <p className="text-sm text-muted-foreground">
                          When we generate a receipt or confirmation email.
                        </p>
                      </div>
                      <Switch
                        checked={prefs.privacyReceiptEmail}
                        onCheckedChange={(c) => savePrefs({ ...prefs, privacyReceiptEmail: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-white px-4 py-4">
                      <div>
                        <p className="font-medium">Anonymous usage analytics</p>
                        <p className="text-sm text-muted-foreground">
                          Help us improve the site with privacy-friendly metrics.
                        </p>
                      </div>
                      <Switch
                        checked={prefs.privacyAnalytics}
                        onCheckedChange={(c) => savePrefs({ ...prefs, privacyAnalytics: c })}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Privacy preferences saved",
                          description: "Stored in this browser only.",
                        })
                      }
                      className="rounded-full px-8 font-semibold text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Save privacy choices
                    </Button>
                  </div>
                )}

                {section === "notifications" && prefsLoaded && (
                  <div className="mt-8 space-y-8">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-white px-4 py-4">
                      <div>
                        <p className="font-medium">Order updates by email</p>
                        <p className="text-sm text-muted-foreground">
                          Confirmations and status when you place an order.
                        </p>
                      </div>
                      <Switch
                        checked={prefs.notifyOrderEmail}
                        onCheckedChange={(c) => savePrefs({ ...prefs, notifyOrderEmail: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-white px-4 py-4">
                      <div>
                        <p className="font-medium">Tips &amp; promotions</p>
                        <p className="text-sm text-muted-foreground">
                          Occasional news from our kitchen (local preference only).
                        </p>
                      </div>
                      <Switch
                        checked={prefs.notifyMarketing}
                        onCheckedChange={(c) => savePrefs({ ...prefs, notifyMarketing: c })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      These toggles are saved in your browser. Actual email delivery depends on your orders and
                      system settings.
                    </p>
                    <Button
                      type="button"
                      onClick={() =>
                        toast({
                          title: "Notification preferences saved",
                          description: "Stored in this browser.",
                        })
                      }
                      className="rounded-full px-8 font-semibold text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      Save notification settings
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile bottom nav mimic — quick link to menu */}
        {user && (
          <div className="mx-auto mt-8 max-w-6xl md:hidden">
            <Button asChild variant="outline" className="w-full rounded-xl py-6">
              <Link href="/menu">Browse menu</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
