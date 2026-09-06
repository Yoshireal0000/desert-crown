// @ts-nocheck
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import {
  ArrowRight,
  ShoppingBag,
  Menu,
  Minus,
  Plus,
  X,
  ChevronDown,
  Crown,
} from "lucide-react";
import "./App.css";
import "./brand.css";
import "./account.css";
type C = "Camel" | "Gray" | "Dark Brown";
type P = { id: string; color: C; price: number; description: string };
type I = P & { size: string; quantity: number };
const ps: P[] = [
  {
    id: "camel",
    color: "Camel",
    price: 185,
    description:
      "A warm camel tone with a softly structured hood and full, generous drape.",
  },
  {
    id: "gray",
    color: "Gray",
    price: 185,
    description:
      "A quiet charcoal gray designed for everyday winter layers and slower mornings.",
  },
  {
    id: "dark-brown",
    color: "Dark Brown",
    price: 185,
    description:
      "A deep espresso brown with rich contrast against its plush interior.",
  },
];
const cl = (c: C) => c.toLowerCase().replace(" ", "-");
function Visual({ c }: { c: C }) {
  return (
    <img className="visual-photo" src={`/farwa-${cl(c)}.png`} alt={`${c} hooded farwa`} />
  );
}
function App() {
  const [cart, setCart] = useState<I[]>(() =>
    JSON.parse(localStorage.getItem("dc-cart") || "[]"),
  );
  const [bag, setBag] = useState(false);
  useEffect(
    () => localStorage.setItem("dc-cart", JSON.stringify(cart)),
    [cart],
  );
  const add = (p: P, s: string, q = 1) => {
    setCart((x) => {
      let f = x.find((i) => i.id === p.id && i.size === s);
      return f
        ? x.map((i) => (i === f ? { ...i, quantity: i.quantity + q } : i))
        : [...x, { ...p, size: s, quantity: q }];
    });
    setBag(true);
  };
  const update = (id: string, s: string, d: number) =>
    setCart((x) =>
      x
        .map((i) =>
          i.id === id && i.size === s ? { ...i, quantity: i.quantity + d } : i,
        )
        .filter((i) => i.quantity),
    );
  return (
    <BrowserRouter>
      <Header
        count={cart.reduce((a, i) => a + i.quantity, 0)}
        open={() => setBag(true)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product add={add} />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <Cart
        open={bag}
        close={() => setBag(false)}
        cart={cart}
        update={update}
      />
    </BrowserRouter>
  );
}
function Mark() {
  return (
    <>
      <Crown aria-hidden="true" size={19} />
      <span>
        DESERT <i>CROWN</i>
      </span>
    </>
  );
}
function Header({ count, open }: { count: number; open: () => void }) {
  const [m, setM] = useState(false);
  return (
    <header>
      <Link className="logo" to="/">
        <Mark />
      </Link>
      <nav className={m ? "shown" : ""}>
        <NavLink to="/shop">Shop</NavLink>
        <NavLink to="/about">Our story</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/account">Account</NavLink>
      </nav>
      <div>
        <button className="bag" onClick={open}>
          <ShoppingBag size={18} />
          Bag {count ? `(${count})` : ""}
        </button>
        <button className="menu" onClick={() => setM(!m)}>
          <Menu />
        </button>
      </div>
    </header>
  );
}
function Home() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">WINTER, KEPT WELL</p>
          <h1>
            Warmth with
            <br />
            <em>presence.</em>
          </h1>
          <p>
            A considered collection of hooded farwa robes for the American
            winter — grounded in tradition, made for the pace of now.
          </p>
          <Link className="button" to="/shop">
            Shop collection <ArrowRight size={16} />
          </Link>
        </div>
        <img
          src="/desert-crown-collection.png"
          alt="Three Desert Crown farwa robes in camel, gray, and dark brown"
        />
      </section>
      <section className="section">
        <p className="eyebrow">THREE SIGNATURE TONES</p>
        <h2>
          Choose your shade
          <br />
          of winter.
        </h2>
        <div className="grid">
          {ps.map((p) => (
            <Link to={"/product/" + p.id} className="card" key={p.id}>
              <div className={"image " + cl(p.color)}>
                <Visual c={p.color} />
              </div>
              <h3>{p.color}</h3>
              <p>Hooded Farwa · $185</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="craft">
        <img
          src="/desert-crown-collection.png"
          alt="Desert Crown collection detail"
        />
        <div>
          <p className="eyebrow">COMFORT, CONSIDERED</p>
          <h2>Built around the ritual of being warm.</h2>
          <p>
            Room to layer. A softly framed hood. The reassuring weight of an
            outer layer you reach for before the temperature asks.
          </p>
          <ul>
            <li>Easy, generous fit</li>
            <li>Soft-touch interior</li>
            <li>Hooded warmth</li>
          </ul>
        </div>
      </section>
      <section className="story section">
        <p className="eyebrow">THE DESERT CROWN WAY</p>
        <h2>
          Heritage in the details.
          <br />
          <em>Ease in the everyday.</em>
        </h2>
        <p>
          We make space for the familiar to feel new again — classic winter
          robes, thoughtfully chosen for homes, drives, gatherings, and the
          quiet in between.
        </p>
        <Link to="/about">
          Read our story <ArrowRight size={16} />
        </Link>
      </section>
      <Signup />
    </main>
  );
}
function Shop() {
  const [f, setF] = useState<C | "All">("All");
  return (
    <main className="section shop">
      <div className="title">
        <p className="eyebrow">THE HOODED COLLECTION</p>
        <h1>
          Find your <em>farwa.</em>
        </h1>
        <p>Three grounded tones, one comforting silhouette.</p>
      </div>
      <div className="filters">
        {(["All", "Camel", "Gray", "Dark Brown"] as const).map((x) => (
          <button
            onClick={() => setF(x)}
            className={f === x ? "on" : ""}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="grid">
        {ps
          .filter((p) => f === "All" || p.color === f)
          .map((p) => (
            <Link to={"/product/" + p.id} className="card" key={p.id}>
              <div className={"image tall " + cl(p.color)}>
                <Visual c={p.color} />
              </div>
              <h3>The Farwa</h3>
              <p>
                {p.color} · ${p.price}
              </p>
            </Link>
          ))}
      </div>
    </main>
  );
}
function Product({ add }: { add: (p: P, s: string, q: number) => void }) {
  const { id = "camel" } = useParams();
  const p = ps.find((x) => x.id === id) || ps[0];
  const [s, setS] = useState("M"),
    [q, setQ] = useState(1),
    [a, setA] = useState("Fit & sizing");
  return (
    <main className="product section">
      <div className="product-gallery">
        <div className={"image large " + cl(p.color)}>
          <Visual c={p.color} />
        </div>
        <img
          src="/desert-crown-collection.png"
          alt={p.color + " farwa detail"}
        />
      </div>
      <div className="buy">
        <p className="eyebrow">HOODED FARWA / {p.color.toUpperCase()}</p>
        <h1>
          The Farwa <b>${p.price}</b>
        </h1>
        <p>{p.description}</p>
        <label>
          Color <span>{p.color}</span>
        </label>
        <div className="dots">
          {ps.map((x) => (
            <Link
              aria-label={x.color}
              className={"dot " + cl(x.color) + (p === x ? " selected" : "")}
              to={"/product/" + x.id}
              key={x.id}
            />
          ))}
        </div>
        <label>Size</label>
        <div className="sizes">
          {["S", "M", "L", "XL"].map((x) => (
            <button
              className={s === x ? "on" : ""}
              onClick={() => setS(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="add">
          <div>
            <button onClick={() => setQ(Math.max(1, q - 1))}>
              <Minus size={14} />
            </button>
            {q}
            <button onClick={() => setQ(q + 1)}>
              <Plus size={14} />
            </button>
          </div>
          <button className="button" onClick={() => add(p, s, q)}>
            Add to bag <ArrowRight size={16} />
          </button>
        </div>
        {["Fit & sizing", "Care", "Shipping & returns"].map((x) => (
          <article key={x}>
            <button onClick={() => setA(a === x ? "" : x)}>
              {x}
              <ChevronDown size={16} />
            </button>
            {a === x && (
              <p>
                {x === "Fit & sizing"
                  ? "Designed with a relaxed, layering-friendly silhouette. Choose your usual size for an easy fit."
                  : x === "Care"
                    ? "Spot clean when possible. Refer to the garment care label for the best care guidance."
                    : "Shipping and returns details will be shared here as fulfillment policy is finalized."}
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
function Account() {
  const emailDeliveryAvailable = false;
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [notice, setNotice] = useState(""),
    [user, setUser] = useState<{ email: string; role: string } | null>(null),
    [orders, setOrders] = useState<
      { id: string; subtotalCents: number; status: string; createdAt: string }[]
    >([]),
    [ownerOrders, setOwnerOrders] = useState<
      {
        id: string;
        email: string;
        subtotalCents: number;
        status: string;
        createdAt: string;
      }[]
    >([]);
  const load = () =>
    fetch("/api/account")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUser(data.user);
          setOrders(data.orders);
        }
      });
  useEffect(() => {
    load();
  }, []);
  const request = async () => {
    const r = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await r.json();
    setNotice(data.message || data.error);
  };
  const verify = async () => {
    const r = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await r.json();
    if (data.ok) {
      setNotice("Verified. Welcome to Desert Crown.");
      load();
    } else setNotice(data.error);
  };
  const loadOwner = async () => {
    const r = await fetch("/api/owner/orders");
    const data = await r.json();
    if (data.orders) setOwnerOrders(data.orders);
    else setNotice(data.error);
  };
  return (
    <main className="section account">
      <p className="eyebrow">DESERT CROWN ACCOUNT</p>
      <h1>
        {user ? <><span>Your </span><em>dashboard.</em></> : <><span>A more personal</span><br/><em>Desert Crown.</em></>}
      </h1>
      {user ? (
        <>
          <div className="account-summary">
            <div>
              <span>Signed in as</span>
              <b>{user.email}</b>
            </div>
            <div>
              <span>Access</span>
              <b>
                {user.role === "owner" ? "Owner dashboard" : "Customer account"}
              </b>
            </div>
            <div>
              <span>Orders</span>
              <b>{orders.length}</b>
            </div>
          </div>
          <section className="dashboard-card">
            <h2>Order history</h2>
            {orders.length ? (
              <div className="order-table">
                {orders.map((order) => (
                  <p key={order.id}>
                    <b>{order.id}</b>
                    <span>{order.status.replace("_", " ")}</span>
                    <strong>${(order.subtotalCents / 100).toFixed(2)}</strong>
                  </p>
                ))}
              </div>
            ) : (
              <p className="muted">
                Your future orders will appear here after checkout is connected.
              </p>
            )}
          </section>
          {user.role === "owner" && (
            <section className="dashboard-card owner">
              <div>
                <h2>Owner console</h2>
                <p>View incoming orders and payment status in one place.</p>
              </div>
              <button className="button" onClick={loadOwner}>
                Load all orders
              </button>
              {ownerOrders.map((order) => (
                <p className="owner-order" key={order.id}>
                  <b>{order.id}</b>
                  <span>{order.email}</span>
                  <span>{order.status.replace("_", " ")}</span>
                  <strong>${(order.subtotalCents / 100).toFixed(2)}</strong>
                </p>
              ))}
            </section>
          )}
        </>
      ) : (
        <section className="verify-card">
          <span className="step">01</span>
          <h2>
            Sign in with a<br />
            <em>one-time code.</em>
          </h2>
          <p>
            We use a short verification code instead of a password. Your account
            keeps orders and delivery details in one place.
          </p>
          <input
            aria-label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button className="button" onClick={request} disabled={!emailDeliveryAvailable}>
            Email sign-in unavailable
          </button>
          <div className="code-row">
            <input
              aria-label="Six digit verification code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="6-digit code"
              inputMode="numeric"
              disabled={!emailDeliveryAvailable}
            />
            <button onClick={verify} disabled={!emailDeliveryAvailable}>Verify</button>
          </div>
          {notice && <p className="notice">{notice}</p>}
          <small>
            Email sign-in will stay unavailable until a transactional sender is connected. No marketing emails are sent from this flow.
          </small>
        </section>
      )}
    </main>
  );
}
function Cart({
  open,
  close,
  cart,
  update,
}: {
  open: boolean;
  close: () => void;
  cart: I[];
  update: (id: string, s: string, d: number) => void;
}) {
  let t = cart.reduce((a, x) => a + x.price * x.quantity, 0);
  return (
    <div className={"drawer " + (open ? "open" : "")}>
      <div onClick={close} />
      <aside>
        <button className="close" onClick={close}>
          <X />
        </button>
        <h2>Your bag ({cart.reduce((a, x) => a + x.quantity, 0)})</h2>
        {cart.length ? (
          <>
            <section>
              {cart.map((x) => (
                <div className="line" key={x.id + x.size}>
                  <div className={"mini " + cl(x.color)}>
                    <Visual c={x.color} />
                  </div>
                  <p>
                    {x.color} / {x.size}
                    <strong>The Farwa</strong>${x.price}
                    <span>
                      <button onClick={() => update(x.id, x.size, -1)}>
                        <Minus size={13} />
                      </button>
                      {x.quantity}
                      <button onClick={() => update(x.id, x.size, 1)}>
                        <Plus size={13} />
                      </button>
                    </span>
                  </p>
                </div>
              ))}
            </section>
            <footer>
              <b>
                Subtotal <span>${t}</span>
              </b>
              <small>Taxes and delivery are calculated at checkout.</small>
              <button
                className="button"
                onClick={() =>
                  alert(
                    "Checkout is coming soon. Please contact Desert Crown for ordering support.",
                  )
                }
              >
                Checkout coming soon <ArrowRight size={16} />
              </button>
            </footer>
          </>
        ) : (
          <section className="empty">
            <ShoppingBag size={35} />
            <h3>Your bag is quiet.</h3>
            <p>Bring home a farwa when you’re ready.</p>
            <button className="button" onClick={close}>
              Continue shopping
            </button>
          </section>
        )}
      </aside>
    </div>
  );
}
function About() {
  return (
    <main className="section simple">
      <p className="eyebrow">OUR STORY</p>
      <h1>
        Rooted in warmth.
        <br />
        <em>Made for here.</em>
      </h1>
      <p>
        Desert Crown is an invitation to keep a familiar ritual close — the
        feeling of reaching for a farwa when the air shifts, then carrying that
        comfort into a new setting.
      </p>
    </main>
  );
}
function Contact() {
  const [done, setDone] = useState(false);
  return (
    <main className="section simple">
      <p className="eyebrow">SAY HELLO</p>
      <h1>
        We’d love to
        <br />
        <em>hear from you.</em>
      </h1>
      <p>
        Questions about the collection, fit, or your order? Leave a note and our
        team will be in touch.
      </p>
      {done ? (
        <p className="success">Thank you — your note is ready for our team.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <input placeholder="Your name" required />
          <input placeholder="you@example.com" type="email" required />
          <textarea placeholder="How can we help?" required />
          <button className="button">
            Send message <ArrowRight size={16} />
          </button>
        </form>
      )}
    </main>
  );
}
function Signup() {
  const [d, setD] = useState(false);
  return (
    <section className="signup">
      <div>
        <p className="eyebrow">FIRST TO KNOW</p>
        <h2>
          Notes from the
          <br />
          <em>desert.</em>
        </h2>
      </div>
      {d ? (
        <p className="success">You’re on the list. Welcome in.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setD(true);
          }}
        >
          <input type="email" placeholder="Your email address" required />
          <button>
            <ArrowRight size={18} />
          </button>
          <small>Occasional collection notes. No noise.</small>
        </form>
      )}
    </section>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <Link className="logo" to="/">
        <Mark />
      </Link>
      <p>Traditional warmth, considered for now.</p>
      <div>
        <Link to="/shop">Shop</Link>
        <Link to="/about">Our story</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <small>© {new Date().getFullYear()} Desert Crown.</small>
    </footer>
  );
}
export default App;
