import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function SupabaseTestPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Query live products from Supabase
  const { data: products, error: productError } = await supabase
    .from("Product")
    .select("id, name, price, unit, stock, category")
    .limit(10);

  // 2. Query 'todos' table if created
  const { data: todos, error: todosError } = await supabase
    .from("todos")
    .select("*");

  const isConnected = !productError || !todosError;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "700px", margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", margin: 0, color: "#0f172a" }}>
          ⚡ Supabase Connection Status
        </h1>
        <Link href="/" style={{ color: "#16a34a", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
          ← Back to Home
        </Link>
      </div>

      <div style={{
        padding: "16px 20px",
        background: isConnected ? "#ecfdf5" : "#fef2f2",
        border: `1.5px solid ${isConnected ? "#a7f3d0" : "#fca5a5"}`,
        borderRadius: "12px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{ fontSize: "1.8rem" }}>{isConnected ? "✅" : "❌"}</div>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px 0", color: isConnected ? "#065f46" : "#991b1b" }}>
            {isConnected ? "Supabase Client Connected Successfully!" : "Supabase Connection Error"}
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: isConnected ? "#047857" : "#b91c1c" }}>
            Connected to <code>https://ltexrevhqnhawknvhxup.supabase.co</code> using <code>@supabase/ssr</code>.
          </p>
        </div>
      </div>

      {/* Live Database Table (Product) */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 12px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
          📦 Live Database Query: <code>public.Product</code>
        </h3>
        {productError ? (
          <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>Error querying Product: {productError.message}</p>
        ) : products && products.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.95rem", lineHeight: "1.8" }}>
            {products.map((item: any) => (
              <li key={item.id} style={{ color: "#334155" }}>
                <strong>{item.name}</strong> ({item.category}) — ₹{item.price} {item.unit} | Stock: {item.stock}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>No products in database yet.</p>
        )}
      </div>

      {/* Tutorial Todos Table */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 12px 0", color: "#1e293b" }}>
          📝 Quickstart Table: <code>public.todos</code>
        </h3>
        {todosError ? (
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0, lineHeight: "1.6" }}>
            ℹ️ Table <code>todos</code> doesn&apos;t exist yet in your Supabase project (this was an example template from Supabase docs). Your real app data is in tables like <code>Product</code>, <code>Seller</code>, <code>Order</code>, etc.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            {todos && todos.length > 0 ? (
              todos.map((todo: any) => (
                <li key={todo.id}>{todo.name || todo.title || JSON.stringify(todo)}</li>
              ))
            ) : (
              <li style={{ color: "#64748b" }}>0 todos found.</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
