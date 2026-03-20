"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
// Visible duration before auto-dismiss starts (paused while cart sheet is open)
const TOAST_DURATION = 4000
// How long to keep the toast mounted after dismissal (for exit animation)
const TOAST_REMOVE_DELAY = 500

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

type ToastTimerMeta = {
  remaining: number
  startedAt?: number
  timeout?: ReturnType<typeof setTimeout>
}

let isCartOpen = false
const toastTimers = new Map<string, ToastTimerMeta>()

function clearToastTimer(toastId: string) {
  const meta = toastTimers.get(toastId)
  if (meta?.timeout) clearTimeout(meta.timeout)
  toastTimers.delete(toastId)
}

function startToastTimer(toastId: string, duration: number) {
  const timeout = setTimeout(() => {
    // Timer finished naturally; dismiss the toast.
    clearToastTimer(toastId)
    dispatch({
      type: "DISMISS_TOAST",
      toastId,
    })
  }, duration)

  toastTimers.set(toastId, {
    remaining: duration,
    startedAt: Date.now(),
    timeout,
  })
}

function pauseToastTimer(toastId: string) {
  const meta = toastTimers.get(toastId)
  if (!meta?.timeout || !meta.startedAt) return

  const elapsed = Date.now() - meta.startedAt
  const remaining = Math.max(0, meta.remaining - elapsed)

  clearTimeout(meta.timeout)
  toastTimers.set(toastId, {
    ...meta,
    remaining,
    timeout: undefined,
    startedAt: undefined,
  })
}

function resumeToastTimer(toastId: string) {
  const meta = toastTimers.get(toastId)
  if (!meta || meta.timeout) return

  if (meta.remaining <= 0) {
    clearToastTimer(toastId)
    dispatch({ type: "DISMISS_TOAST", toastId })
    return
  }

  startToastTimer(toastId, meta.remaining)
}

function pauseAllToastTimers() {
  toastTimers.forEach((_meta, toastId) => pauseToastTimer(toastId))
}

function resumeAllToastTimers() {
  toastTimers.forEach((meta, toastId) => {
    if (!meta.timeout) resumeToastTimer(toastId)
  })
}

// Used by `Toaster` so toasts don't visually collide with the cart `Sheet`.
// We also pause auto-dismiss countdown while the cart is open.
export function setCartOpen(open: boolean) {
  if (isCartOpen === open) return
  isCartOpen = open

  if (open) {
    pauseAllToastTimers()
  } else {
    resumeAllToastTimers()
  }
}

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  if (action.type === "DISMISS_TOAST") {
    if (action.toastId) {
      clearToastTimer(action.toastId)
    } else {
      // Dismiss all toasts
      ;[...toastTimers.keys()].forEach((id) => clearToastTimer(id))
    }
  }
  if (action.type === "REMOVE_TOAST") {
    if (action.toastId) {
      clearToastTimer(action.toastId)
    } else {
      // Remove all toasts
      ;[...toastTimers.keys()].forEach((id) => clearToastTimer(id))
    }
  }

  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  // Auto-dismiss after a few seconds (paused while the cart sheet is open).
  toastTimers.set(id, { remaining: TOAST_DURATION })
  if (!isCartOpen) startToastTimer(id, TOAST_DURATION)

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
