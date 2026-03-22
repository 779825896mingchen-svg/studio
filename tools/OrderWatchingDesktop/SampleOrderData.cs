using System.Data;

namespace OrderWatchingDesktop;

/// <summary>In-memory orders for POS UI demos when <c>OrderWatch:UseSampleData</c> is true.</summary>
internal static class SampleOrderData
{
    private const string User = "suj9988";

    public static DataTable BuildLiveTable(string storeUser)
    {
        var t = EmptySchema();
        var u = string.IsNullOrEmpty(storeUser) ? User : storeUser;

        AddRow(t, 1, "WEB-1774210784831", new DateTime(2026, 3, 22, 20, 19, 0), 1, u,
            "videouploadclip123@gmail.com", "Anthony", "Boyero", "9198796797",
            8.75m, 0.70m,
            """
            Pickup: ASAP
            Phone: 9198796797
            --- Items ---
            1x Chow Mein (Choice: Shrimp) @ $8.75
            """);

        AddRow(t, 2, "WEB-1774210417083", new DateTime(2026, 3, 22, 20, 13, 0), 1, u,
            "videouploadclip123@gmail.com", "Anthony", "Boyero", "9198796797",
            43.75m, 3.50m,
            """
            Pickup: ASAP
            Phone: 9198796797
            --- Items ---
            1x Chow Mein (Choice: Chicken) @ $8.75
            1x Chow Mein (Choice: Shrimp) @ $8.75
            1x Moo Goo Gai Pan @ $8.75
            1x Mixed Vegetable w. Garlic @ $9.00
            """);

        AddRow(t, 3, "WEB-1774210100001", new DateTime(2026, 3, 22, 19, 45, 0), 1, u,
            "guest1@example.com", "Mia", "Chen", "9195550101",
            11.50m, 0.92m,
            """
            Pickup: ASAP
            Phone: 9195550101
            --- Items ---
            1x Vegetable Fried Rice @ $11.50
            """);

        AddRow(t, 4, "WEB-1774210100002", new DateTime(2026, 3, 22, 19, 30, 0), 1, u,
            "guest2@example.com", "Jordan", "Lee", "9195550102",
            24.00m, 1.92m,
            """
            Pickup: 7:00 PM
            Phone: 9195550102
            --- Items ---
            2x Egg Rolls @ $6.00
            1x Sweet and Sour Chicken @ $12.00
            """);

        AddRow(t, 5, "WEB-1774210100003", new DateTime(2026, 3, 22, 19, 10, 0), 1, u,
            "guest3@example.com", "Sam", "Rivera", "9195550103",
            18.25m, 1.46m,
            """
            Pickup: ASAP
            Phone: 9195550103
            --- Items ---
            1x Mongolian Beef @ $13.25
            1x Hot & Sour Soup @ $5.00
            """);

        AddRow(t, 6, "WEB-1774210100004", new DateTime(2026, 3, 22, 18, 55, 0), 1, u,
            "guest4@example.com", "Taylor", "Nguyen", "9195550104",
            32.00m, 2.56m,
            """
            Pickup: ASAP
            Phone: 9195550104
            --- Items ---
            1x General Tso's Chicken @ $12.50
            1x Chicken Lo Mein @ $9.00
            1x Crab Rangoon (6) @ $6.50
            """);

        return t;
    }

    /// <summary>193 completed rows (4 featured + generated) for pagination demos.</summary>
    public static DataTable BuildHistoryTable(string storeUser)
    {
        var t = EmptySchema();
        var u = string.IsNullOrEmpty(storeUser) ? User : storeUser;

        AddRow(t, 101, "WEB-1774210452086", new DateTime(2026, 3, 19, 12, 52, 0), 2, u,
            "videouploadclip123@gmail.com", "Anthony", "Boyero", "(919) 879-7697",
            15.00m, 0m,
            """
            --- Items ---
            1x Beef with Broccoli @ $9.00
            2x Egg Rolls @ $6.00
            """);

        AddRow(t, 102, "WEB-1774201559562", new DateTime(2026, 3, 19, 16, 10, 0), 2, u,
            "videouploadclip123@gmail.com", "Anthony", "Boyero", "(919) 879-7697",
            9.75m, 0m,
            """
            --- Items ---
            1x Moo Shu Pork @ $9.75
            """);

        AddRow(t, 103, "WEB-1774189633366", new DateTime(2026, 3, 12, 18, 25, 0), 2, u,
            "kathrynsims@gmail.com", "Kathryn", "Sims", "(919) 555-8210",
            19.00m, 0m,
            """
            --- Items ---
            1x Chicken Lo Mein @ $9.00
            1x Shrimp Egg Foo Young @ $10.00
            """);

        AddRow(t, 104, "WEB-1774106297328", new DateTime(2026, 3, 7, 18, 40, 0), 2, u,
            "daniel.franklin@gmail.com", "Daniel", "Franklin", "(919) 555-1188",
            9.75m, 0m,
            """
            --- Items ---
            1x Kung Pao Chicken @ $9.75
            """);

        var dishes = new[]
        {
            ("Sesame Chicken", 11.50m),
            ("Beef with Broccoli", 9.00m),
            ("Shrimp Fried Rice", 10.25m),
            ("Hot & Sour Soup", 5.00m),
            ("Vegetable Lo Mein", 8.50m),
            ("Orange Chicken", 12.00m),
            ("Happy Family", 14.75m),
        };

        var rng = new Random(17742);
        for (var i = 5; i < 194; i++)
        {
            var id = 200 + i;
            var daysAgo = rng.Next(1, 120);
            var dt = DateTime.Today.AddDays(-daysAgo).AddHours(rng.Next(11, 21)).AddMinutes(rng.Next(0, 59));
            var dish = dishes[rng.Next(dishes.Length)];
            var qty = rng.Next(1, 3);
            var sub = Math.Round(dish.Item2 * qty, 2);
            var tax = Math.Round(sub * 0.08m, 2);
            var webNum = 1774000000000L - i * 777777L;
            AddRow(t, id, $"WEB-{webNum}", dt, 2, u,
                $"customer{i}@example.com", "Guest", $"Order{i}", $"(919) 555-{1000 + i % 9000:D4}",
                sub, tax,
                $"""
                --- Items ---
                {qty}x {dish.Item1} @ ${dish.Item2:F2}
                """);
        }

        return t;
    }

    private static DataTable EmptySchema()
    {
        var t = new DataTable();
        t.Columns.Add("orderID", typeof(int));
        t.Columns.Add("orderNumber", typeof(string));
        t.Columns.Add("orderDate", typeof(DateTime));
        t.Columns.Add("orderStatusID", typeof(int));
        t.Columns.Add("userName", typeof(string));
        t.Columns.Add("email", typeof(string));
        t.Columns.Add("firstName", typeof(string));
        t.Columns.Add("lastName", typeof(string));
        t.Columns.Add("customerName", typeof(string));
        t.Columns.Add("phone", typeof(string));
        t.Columns.Add("subTotalAmount", typeof(decimal));
        t.Columns.Add("taxAmount", typeof(decimal));
        t.Columns.Add("specialInstructions", typeof(string));
        t.Columns.Add("createdOn", typeof(DateTime));
        t.Columns.Add("modifiedOn", typeof(DateTime));
        return t;
    }

    private static void AddRow(
        DataTable t,
        int orderId,
        string orderNumber,
        DateTime orderDate,
        int statusId,
        string userName,
        string email,
        string firstName,
        string lastName,
        string phone,
        decimal sub,
        decimal tax,
        string spec)
    {
        var r = t.NewRow();
        r["orderID"] = orderId;
        r["orderNumber"] = orderNumber;
        r["orderDate"] = orderDate;
        r["orderStatusID"] = statusId;
        r["userName"] = userName;
        r["email"] = email;
        r["firstName"] = firstName;
        r["lastName"] = lastName;
        r["customerName"] = $"{firstName} {lastName}".Trim();
        r["phone"] = phone;
        r["subTotalAmount"] = sub;
        r["taxAmount"] = tax;
        r["specialInstructions"] = spec;
        r["createdOn"] = orderDate;
        r["modifiedOn"] = orderDate;
        t.Rows.Add(r);
    }
}
