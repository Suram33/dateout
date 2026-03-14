import { useState, useRef, useEffect } from "react";
import { supabase } from './supabaseClient';

const SCREENS = { AUTH:"auth", DISCOVER:"discover", PROFILE:"profile", MESSAGES:"messages", CHAT:"chat", CALENDAR:"calendar", MY_PROFILE:"my_profile", EDIT_PROFILE:"edit_profile" };
const ACTIVITIES = ["☕ Coffee","🎬 Movie","🍕 Dinner","🏞️ Hike","🎨 Gallery","🎳 Bowling","🎭 Theatre","🍦 Ice Cream","🎮 Arcade","📚 Bookstore"];
const AD_BANNERS = ["☕ Brew & Co. — 10% off first visit!","🎬 CineMax — Date Night: 2 tickets + popcorn ₹499","🍕 Pizzeria Stella — Romantic dinner, save 20%"];

const MOCK_PROFILES = [
  { id:1, name:"Ariana", age:26, distance:"0.8 km", bio:"Gallery hopper by day, pasta chef by night. Looking for someone to argue about films with over good espresso.", activities:["☕ Coffee","🎨 Gallery","🎬 Movie"], photos:["🌸","🎨","☕"], verified:true, online:true, hourlyRate:350, mode:"go" },
  { id:2, name:"Marcus", age:29, distance:"1.2 km", bio:"Hiking trails and vinyl records. I'll show you the best hidden coffee spot in the city if you're lucky.", activities:["🏞️ Hike","☕ Coffee","🍕 Dinner"], photos:["🏔️","🎵","🌿"], verified:true, online:false, hourlyRate:500, mode:"go" },
  { id:3, name:"Zoe", age:24, distance:"2.1 km", bio:"Bookworm who somehow also loves bowling. I promise I'll let you win. (I won't.)", activities:["📚 Bookstore","🎳 Bowling","🍦 Ice Cream"], photos:["📖","🎳","🌙"], verified:false, online:true, hourlyRate:200, mode:"book" },
  { id:4, name:"Liam", age:31, distance:"3.4 km", bio:"Theatre nerd. Ex-chef. Currently obsessed with finding the city's best burger. Join the quest?", activities:["🎭 Theatre","🍕 Dinner","🎬 Movie"], photos:["🎭","🍔","🌃"], verified:true, online:true, hourlyRate:750, mode:"go" },
  { id:5, name:"Sofia", age:27, distance:"1.9 km", bio:"Arcade champion (self-proclaimed). I take ice cream very seriously. Let's go on the most fun date ever.", activities:["🎮 Arcade","🍦 Ice Cream","☕ Coffee"], photos:["🎮","🌈","✨"], verified:false, online:false, hourlyRate:300, mode:"book" },
];

const MOCK_MESSAGES = [
  { id:1, profile:MOCK_PROFILES[0], lastMsg:"That coffee place sounds perfect! 😍", time:"2m", unread:2 },
  { id:2, profile:MOCK_PROFILES[1], lastMsg:"Sure, Saturday works for me!", time:"1h", unread:0 },
  { id:3, profile:MOCK_PROFILES[3], lastMsg:"Have you seen the new show at the theatre?", time:"3h", unread:1 },
];

const BOOKED_DATES = ["2026-03-14","2026-03-18","2026-03-22"];
const MY_DATES = ["2026-03-15","2026-03-20"];

const MODE = {
  go: {
    label:"Go on a Date", emoji:"💃", color:"#9b59b6",
    gradient:"linear-gradient(135deg,#9b59b6,#7d3c98)",
    bg:"linear-gradient(160deg,#fdf5ff 0%,#f3e5ff 40%,#e8d5fa 100%)",
    cardBg:"#fdf5ff", cardBorder:"#e0c8f5",
    tagBg:"#f8f0ff", tagBorder:"#d8b8f0", tagColor:"#7d3c98",
    headline:"People looking to book someone",
    sub:"They pay you · Set your rate & availability",
    cta:"💬 Message to Connect", ctaBook:"📅 Set Availability",
    discoverTitle:"Who's Booking?", discoverSub:"People who want to take you out",
  },
  book: {
    label:"Book a Date", emoji:"🕵️", color:"#e87c3e",
    gradient:"linear-gradient(135deg,#e87c3e,#d45a1e)",
    bg:"linear-gradient(160deg,#fff5eb 0%,#ffe8cc 40%,#ffd4a8 100%)",
    cardBg:"#fffaf5", cardBorder:"#f5e0cb",
    tagBg:"#fff5ec", tagBorder:"#f0c49a", tagColor:"#b05a20",
    headline:"Available companions nearby",
    sub:"Browse · Message · Agree · Book & pay",
    cta:"💬 Message to Book", ctaBook:"📅 Check Availability",
    discoverTitle:"Browse Companions", discoverSub:"People available to go on a date",
  },
};

function AdBanner({ idx }) {
  return (
    <div style={{ background:"linear-gradient(90deg,#fff8f0,#fff3e8)", border:"1px solid #f5c89a", borderRadius:10, padding:"8px 14px", fontSize:12, color:"#a0522d", textAlign:"center", margin:"8px 0" }}>
      📢 AD · {AD_BANNERS[idx % AD_BANNERS.length]}
    </div>
  );
}

function Avatar({ emoji, size=56, online }) {
  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#f9e4cc,#f0c08a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.45, border:"2.5px solid #e8a86b" }}>{emoji}</div>
      {online!==undefined && <div style={{ position:"absolute", bottom:2, right:2, width:12, height:12, borderRadius:"50%", background:online?"#4caf7d":"#ccc", border:"2px solid #fff" }} />}
    </div>
  );
}

function ModeToggle({ dateMode, setDateMode, compact=false }) {
  return (
    <div style={{ display:"flex", background:"rgba(0,0,0,0.08)", borderRadius:40, padding:3, gap:2 }}>
      {["go","book"].map(k=>{
        const active = dateMode===k;
        const cfg = MODE[k];
        return (
          <button key={k} onClick={()=>setDateMode(k)} style={{
            display:"flex", alignItems:"center", gap:compact?4:6,
            padding:compact?"6px 12px":"9px 18px",
            borderRadius:36, border:"none", cursor:"pointer",
            background:active?cfg.gradient:"transparent",
            color:active?"#fff":"rgba(0,0,0,0.45)",
            fontFamily:"'Playfair Display',Georgia,serif",
            fontWeight:active?700:400, fontSize:compact?11:13,
            transition:"all 0.22s",
            boxShadow:active?"0 2px 12px rgba(0,0,0,0.2)":"none",
            whiteSpace:"nowrap",
          }}>
            <span>{cfg.emoji}</span><span>{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ProfileCard({ profile, onClick, dateMode }) {
  const cfg = MODE[dateMode];
  return (
    <div onClick={onClick} style={{ background:cfg.cardBg, borderRadius:20, padding:"18px 16px", boxShadow:"0 4px 24px rgba(0,0,0,0.07)", cursor:"pointer", transition:"transform 0.18s,box-shadow 0.18s", border:`1px solid ${cfg.cardBorder}`, position:"relative" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.13)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.07)";}}>
      <div style={{ position:"absolute", top:14, right:14, background:MODE[profile.mode].gradient, color:"#fff", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
        {profile.mode==="go"?"💃 Go on Date":"🕵️ Booking"}
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
        <Avatar emoji={profile.photos[0]} size={62} online={profile.online} />
        <div style={{ flex:1, minWidth:0, paddingRight:90 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:18, fontWeight:700, color:"#3d1f00" }}>{profile.name}</span>
            <span style={{ fontSize:15, color:"#8a6040" }}>{profile.age}</span>
            {profile.verified && <span style={{ fontSize:13, color:"#e8824e" }}>✓</span>}
          </div>
          <div style={{ fontSize:12, color:"#c07040", marginTop:2 }}>📍 {profile.distance} away</div>
          <p style={{ fontSize:13, color:"#6b4226", margin:"6px 0 8px", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{profile.bio}</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {profile.activities.slice(0,2).map(a=><span key={a} style={{ background:cfg.tagBg, border:`1px solid ${cfg.tagBorder}`, borderRadius:20, padding:"2px 9px", fontSize:11, color:cfg.tagColor }}>{a}</span>)}
            </div>
            <span style={{ background:cfg.gradient, color:"#fff", borderRadius:20, padding:"4px 11px", fontSize:13, fontWeight:700, whiteSpace:"nowrap" }}>₹{profile.hourlyRate}/hr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inp = {
    width:"100%", padding:"12px 14px", borderRadius:12,
    border:"1.5px solid #f0c49a", fontSize:15, fontFamily:"Georgia,serif",
    background:"#fffaf5", color:"#3d1f00", outline:"none",
    boxSizing:"border-box", marginBottom:12
  };

  const handleAuth = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: { data: { name: name } }
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: name || "New User",
          age: 25,
          bio: "",
          hourly_rate: 300,
          mode: "book",
        });
      }
      setError("? Account created! Now sign in below.");
      setMode("login");
      setLoading(false);

    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      onLogin(data.user);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fff5eb,#ffe8cc,#ffd4a8)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"Georgia,serif" }}>
      <div style={{ fontSize:48, marginBottom:8 }}>??</div>
      <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:38, color:"#3d1f00", margin:0, letterSpacing:-1 }}>DateOut</h1>
      <p style={{ color:"#c07040", marginBottom:32, fontSize:15, textAlign:"center" }}>Go on dates ? Book dates ? Get paid</p>
      <div style={{ background:"#fff", borderRadius:24, padding:"32px 28px", width:"100%", maxWidth:380, boxShadow:"0 8px 48px rgba(180,80,10,0.13)" }}>
        <div style={{ display:"flex", background:"#fff5ec", borderRadius:12, marginBottom:22, padding:3 }}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{ setMode(m); setError(""); }} style={{ flex:1, padding:"9px 0", borderRadius:10, border:"none", background:mode===m?"#e87c3e":"transparent", color:mode===m?"#fff":"#c07040", fontFamily:"Georgia,serif", fontSize:14, fontWeight:mode===m?700:400, cursor:"pointer" }}>
              {m==="login"?"Sign In":"Create Account"}
            </button>
          ))}
        </div>
        {mode==="signup" && (
          <input style={inp} placeholder="Your first name" value={name} onChange={e=>setName(e.target.value)} />
        )}
        <input style={inp} placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input style={inp} placeholder="Password (min 6 characters)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && (
          <div style={{ background:error.startsWith("?")?"#e8f5e9":"#fff0f0", border:`1px solid ${error.startsWith("?")?"#a5d6a7":"#ffcdd2"}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:error.startsWith("?")?"#2e7d32":"#c62828", marginBottom:14 }}>
            {error}
          </div>
        )}
        <button onClick={handleAuth} disabled={loading} style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:loading?"#ccc":"linear-gradient(135deg,#e87c3e,#d45a1e)", color:"#fff", fontSize:16, fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, cursor:loading?"not-allowed":"pointer" }}>
          {loading?"Please wait...":mode==="login"?"Welcome Back ?":"Start Dating ?"}
        </button>
        <p style={{ textAlign:"center", fontSize:12, color:"#c09070", marginTop:14 }}>Free forever ? Supported by local ads</p>
      </div>
      <AdBanner idx={0} />
    </div>
  );
}

function DiscoverScreen({ setScreen, setViewProfile, dateMode, setDateMode }) {
  const [filter, setFilter] = useState("All");
  const cfg = MODE[dateMode];
  const targetMode = dateMode==="book"?"go":"book";
  const profiles = MOCK_PROFILES.filter(p=>p.mode===targetMode&&(filter==="All"||p.activities.some(a=>a.includes(filter.split(" ").slice(1).join(" ")))));
  return (
    <div style={{ paddingBottom:80, background:cfg.bg, minHeight:"100vh" }}>
      <div style={{ padding:"20px 18px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:24, color:"#3d1f00", margin:0 }}>{cfg.discoverTitle}</h2>
            <p style={{ color:"#c07040", fontSize:12, margin:"2px 0 0" }}>📍 Warangal · {profiles.length} nearby</p>
          </div>
          <button onClick={()=>setScreen(SCREENS.MY_PROFILE)} style={{ background:"linear-gradient(135deg,#f9e4cc,#f0c08a)", border:"none", borderRadius:"50%", width:42, height:42, fontSize:20, cursor:"pointer" }}>👤</button>
        </div>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
          <ModeToggle dateMode={dateMode} setDateMode={setDateMode} />
        </div>
        <div style={{ background:`${cfg.color}15`, border:`1px solid ${cfg.color}40`, borderRadius:12, padding:"10px 14px", marginBottom:12 }}>
          <p style={{ margin:0, fontSize:13, color:cfg.color, fontWeight:700 }}>{cfg.emoji} {cfg.headline}</p>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"#8a6040" }}>{cfg.sub}</p>
        </div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {["All","☕ Coffee","🎬 Movie","🏞️ Hike","🍕 Dinner","🎨 Gallery"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ whiteSpace:"nowrap", padding:"6px 14px", borderRadius:20, border:"1.5px solid", borderColor:filter===f?cfg.color:cfg.cardBorder, background:filter===f?cfg.gradient:"#fff", color:filter===f?"#fff":cfg.tagColor, fontSize:12, cursor:"pointer" }}>{f}</button>
          ))}
        </div>
      </div>
      <AdBanner idx={0} />
      <div style={{ padding:"8px 18px", display:"flex", flexDirection:"column", gap:12 }}>
        {profiles.length===0
          ? <div style={{ textAlign:"center", padding:40, color:"#c09070" }}>No profiles match this filter.</div>
          : profiles.map(p=><ProfileCard key={p.id} profile={p} onClick={()=>{setViewProfile(p);setScreen(SCREENS.PROFILE);}} dateMode={dateMode} />)
        }
      </div>
    </div>
  );
}

function ProfileScreen({ profile, setScreen, dateMode }) {
  const [photo, setPhoto] = useState(0);
  const [hours, setHours] = useState(2);
  const cfg = MODE[dateMode];
  if (!profile) return null;
  return (
    <div style={{ paddingBottom:80 }}>
      <div style={{ position:"relative" }}>
        <div style={{ height:220, background:"linear-gradient(160deg,#f9e4cc,#f0c08a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:90 }}>{profile.photos[photo]}</div>
        <button onClick={()=>setScreen(SCREENS.DISCOVER)} style={{ position:"absolute", top:18, left:18, background:"rgba(255,255,255,0.85)", border:"none", borderRadius:"50%", width:38, height:38, fontSize:18, cursor:"pointer" }}>←</button>
        <div style={{ position:"absolute", top:18, right:18, background:MODE[profile.mode].gradient, color:"#fff", borderRadius:20, padding:"5px 13px", fontSize:12, fontWeight:700 }}>
          {profile.mode==="go"?"💃 Available to go":"🕵️ Looking to book"}
        </div>
        <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", display:"flex", gap:7 }}>
          {profile.photos.map((_,i)=><div key={i} onClick={()=>setPhoto(i)} style={{ width:8, height:8, borderRadius:"50%", background:photo===i?"#e87c3e":"rgba(255,255,255,0.6)", cursor:"pointer" }} />)}
        </div>
      </div>
      <div style={{ padding:"20px 20px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:28, color:"#3d1f00", margin:0 }}>{profile.name}, {profile.age}</h2>
          {profile.verified && <span style={{ background:"#fff5ec", border:"1px solid #f0c49a", borderRadius:20, padding:"3px 10px", fontSize:12, color:"#e87c3e" }}>✓</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"8px 0 14px", flexWrap:"wrap" }}>
          <span style={{ color:"#c07040", fontSize:13 }}>📍 {profile.distance} · {profile.online?"🟢 Online":"⚫ Offline"}</span>
          <span style={{ background:cfg.gradient, color:"#fff", borderRadius:20, padding:"5px 14px", fontSize:15, fontWeight:700 }}>₹{profile.hourlyRate}/hr</span>
        </div>
        <p style={{ color:"#5a3010", lineHeight:1.7, fontSize:15 }}>{profile.bio}</p>
        <h4 style={{ color:"#a05020", fontFamily:"'Playfair Display',Georgia,serif", marginBottom:10 }}>Activities</h4>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
          {profile.activities.map(a=><span key={a} style={{ background:cfg.tagBg, border:`1.5px solid ${cfg.tagBorder}`, borderRadius:20, padding:"6px 14px", fontSize:14, color:cfg.tagColor }}>{a}</span>)}
        </div>
        {dateMode==="book" && (
          <div style={{ background:"#fff", borderRadius:16, padding:16, border:`1px solid ${cfg.cardBorder}`, marginBottom:20 }}>
            <h4 style={{ margin:"0 0 10px", color:"#3d1f00", fontFamily:"'Playfair Display',Georgia,serif" }}>💰 Estimate Cost</h4>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:13, color:"#8a6040" }}>Hours:</span>
              {[1,2,3,4].map(h=>(
                <button key={h} onClick={()=>setHours(h)} style={{ width:36, height:36, borderRadius:"50%", border:"1.5px solid", borderColor:hours===h?cfg.color:cfg.cardBorder, background:hours===h?cfg.gradient:"#fff", color:hours===h?"#fff":cfg.tagColor, fontSize:14, fontWeight:700, cursor:"pointer" }}>{h}</button>
              ))}
            </div>
            <div style={{ marginTop:12, background:cfg.tagBg, borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:"#8a6040" }}>{hours}hr date with {profile.name}</span>
              <span style={{ fontSize:20, fontWeight:700, color:cfg.color, fontFamily:"'Playfair Display',Georgia,serif" }}>₹{profile.hourlyRate*hours}</span>
            </div>
          </div>
        )}
        <div style={{ display:"flex", gap:10, marginBottom:10 }}>
          <button onClick={()=>setScreen(SCREENS.MESSAGES)} style={{ flex:1, padding:14, borderRadius:14, border:"none", background:cfg.gradient, color:"#fff", fontSize:14, fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, cursor:"pointer" }}>{cfg.cta}</button>
          <button onClick={()=>setScreen(SCREENS.CALENDAR)} style={{ flex:1, padding:14, borderRadius:14, border:`1.5px solid ${cfg.color}`, background:"#fff", color:cfg.color, fontSize:14, fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, cursor:"pointer" }}>{cfg.ctaBook}</button>
        </div>
      </div>
      <AdBanner idx={1} />
    </div>
  );
}

function MessagesScreen({ setScreen, setChatWith, dateMode }) {
  const cfg = MODE[dateMode];
  return (
    <div style={{ paddingBottom:80 }}>
      <div style={{ padding:"20px 18px 12px", background:cfg.bg }}>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:26, color:"#3d1f00", margin:0 }}>Messages</h2>
        <p style={{ color:"#c07040", fontSize:13, margin:"2px 0 0" }}>Agree on activity & timing · Then book in Calendar</p>
      </div>
      <AdBanner idx={2} />
      <div style={{ padding:"8px 18px", display:"flex", flexDirection:"column", gap:8 }}>
        {MOCK_MESSAGES.map(m=>(
          <div key={m.id} onClick={()=>{setChatWith(m.profile);setScreen(SCREENS.CHAT);}} style={{ display:"flex", gap:14, alignItems:"center", padding:"14px 16px", borderRadius:16, background:"#fff", cursor:"pointer", border:`1px solid ${cfg.cardBorder}`, transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background=cfg.tagBg}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            <Avatar emoji={m.profile.photos[0]} size={52} online={m.profile.online} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:16, fontWeight:700, color:"#3d1f00" }}>{m.profile.name}</span>
                <span style={{ fontSize:11, color:"#c07040" }}>{m.time} ago</span>
              </div>
              <p style={{ margin:"3px 0 0", fontSize:13, color:m.unread>0?"#6b4226":"#a08060", fontWeight:m.unread>0?600:400, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200 }}>{m.lastMsg}</p>
            </div>
            {m.unread>0 && <div style={{ background:cfg.color, color:"#fff", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{m.unread}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatScreen({ profile, setScreen, dateMode }) {
  const [msgs, setMsgs] = useState([
    { from:"them", text:"Hey! I saw your profile 👀", time:"10:23" },
    { from:"me", text:"Hi! I'd love to go for coffee ☕", time:"10:25" },
    { from:"them", text:"That sounds perfect! 😍", time:"10:27" },
  ]);
  const [input, setInput] = useState("");
  const cfg = MODE[dateMode];
  const SUGG = dateMode==="book"
    ? ["When are you free?","How about Saturday?",`I'll pay ₹${(profile?.hourlyRate||300)*2} for 2hrs`,"Let's check the calendar!"]
    : ["Sure, I'm free Saturday!",`My rate is ₹${profile?.hourlyRate||300}/hr`,"Let's go for coffee ☕","Book me on the calendar!"];
  const bottomRef = useRef();
  const send = text => {
    if (!text.trim()) return;
    setMsgs(m=>[...m,{from:"me",text,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
    setInput("");
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
  };
  if (!profile) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <div style={{ padding:"14px 16px", background:cfg.bg, borderBottom:`1px solid ${cfg.cardBorder}`, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={()=>setScreen(SCREENS.MESSAGES)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#c07040" }}>←</button>
        <Avatar emoji={profile.photos[0]} size={42} online={profile.online} />
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:17, fontWeight:700, color:"#3d1f00" }}>{profile.name}</div>
          <div style={{ fontSize:11, color:profile.online?"#4caf7d":"#bbb" }}>{profile.online?"● Online":"● Offline"}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:13, fontWeight:700, color:cfg.color }}>₹{profile.hourlyRate}/hr</div>
          <button onClick={()=>setScreen(SCREENS.CALENDAR)} style={{ background:cfg.gradient, border:"none", borderRadius:10, padding:"5px 10px", fontSize:11, color:"#fff", cursor:"pointer", marginTop:2 }}>📅 Book Date</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", background:"#fffaf5", display:"flex", flexDirection:"column", gap:8 }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.from==="me"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"72%", background:m.from==="me"?cfg.gradient:"#fff", color:m.from==="me"?"#fff":"#3d1f00", borderRadius:m.from==="me"?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"10px 14px", fontSize:14, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", border:m.from==="me"?"none":`1px solid ${cfg.cardBorder}` }}>
              <p style={{ margin:0, lineHeight:1.5 }}>{m.text}</p>
              <span style={{ fontSize:10, opacity:0.7, display:"block", textAlign:"right", marginTop:4 }}>{m.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding:"8px 12px 4px", background:"#fff8f2", borderTop:`1px solid ${cfg.cardBorder}` }}>
        <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:8 }}>
          {SUGG.map(s=><button key={s} onClick={()=>send(s)} style={{ whiteSpace:"nowrap", background:cfg.tagBg, border:`1px solid ${cfg.tagBorder}`, borderRadius:16, padding:"5px 12px", fontSize:12, color:cfg.tagColor, cursor:"pointer" }}>{s}</button>)}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Type a message..." style={{ flex:1, padding:"11px 14px", borderRadius:22, border:`1.5px solid ${cfg.tagBorder}`, background:"#fffaf5", fontSize:14, outline:"none", color:"#3d1f00" }} />
          <button onClick={()=>send(input)} style={{ background:cfg.gradient, border:"none", borderRadius:"50%", width:44, height:44, color:"#fff", fontSize:20, cursor:"pointer" }}>→</button>
        </div>
      </div>
    </div>
  );
}

function CalendarScreen({ setScreen, dateMode }) {
  const [month, setMonth] = useState(2);
  const [year, setYear] = useState(2026);
  const [selected, setSelected] = useState(null);
  const [showBook, setShowBook] = useState(false);
  const [activity, setActivity] = useState("☕ Coffee");
  const [hours, setHours] = useState(2);
  const cfg = MODE[dateMode];
  const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = new Date(year,month+1,0).getDate();
  const firstDay = new Date(year,month,1).getDay();
  const ds = d=>`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  return (
    <div style={{ paddingBottom:80 }}>
      <div style={{ padding:"20px 18px 12px", background:cfg.bg }}>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:26, color:"#3d1f00", margin:0 }}>
          {dateMode==="go"?"📅 My Availability":"📅 Book a Date"}
        </h2>
        <p style={{ color:"#c07040", fontSize:13, margin:"2px 0 0" }}>
          {dateMode==="go"?"Mark when you're free to be booked":"Pick a date · Agree activity in messages first"}
        </p>
      </div>
      <div style={{ margin:"0 18px 0", background:`${cfg.color}15`, border:`1px solid ${cfg.color}40`, borderRadius:12, padding:"10px 14px" }}>
        <p style={{ margin:0, fontSize:13, color:cfg.color, fontWeight:700 }}>{cfg.emoji} {dateMode==="go"?"Go mode — set when you're available":"Book mode — find a free slot & confirm"}</p>
      </div>
      <div style={{ padding:"14px 18px" }}>
        <div style={{ background:"#fff", borderRadius:20, padding:20, boxShadow:"0 4px 24px rgba(0,0,0,0.07)", border:`1px solid ${cfg.cardBorder}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}} style={{ background:cfg.tagBg, border:"none", borderRadius:10, width:34, height:34, fontSize:18, cursor:"pointer", color:cfg.tagColor }}>‹</button>
            <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:19, color:"#3d1f00", fontWeight:700 }}>{MN[month]} {year}</span>
            <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}} style={{ background:cfg.tagBg, border:"none", borderRadius:10, width:34, height:34, fontSize:18, cursor:"pointer", color:cfg.tagColor }}>›</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", textAlign:"center", gap:4 }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{ fontSize:11, color:"#c09070", fontWeight:700, paddingBottom:6 }}>{d}</div>)}
            {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`} />)}
            {Array(days).fill(null).map((_,i)=>{
              const d=i+1, booked=BOOKED_DATES.includes(ds(d)), mine=MY_DATES.includes(ds(d)), sel=selected===d;
              return (
                <div key={d} onClick={()=>{setSelected(d);setShowBook(!booked);}} style={{ aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", fontSize:14, cursor:"pointer", background:sel?cfg.color:booked?"#ffd4a8":mine?"#d4f0c8":"transparent", color:sel?"#fff":booked?"#c05a00":mine?"#2a7a00":"#3d1f00", border:sel?"none":booked?"1.5px solid #f0a050":mine?"1.5px solid #6abf69":"1.5px solid transparent", fontWeight:(booked||mine)?700:400, transition:"all 0.15s" }}>
                  {d}
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:14, marginTop:14, justifyContent:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#c05a00" }}>🟠 Booked</span>
            <span style={{ fontSize:12, color:"#2a7a00" }}>🟢 Your dates</span>
            <span style={{ fontSize:12, color:cfg.color }}>● Selected</span>
          </div>
        </div>

        {showBook && selected && (
          <div style={{ marginTop:16, background:"#fff", borderRadius:20, padding:20, border:`1px solid ${cfg.cardBorder}` }}>
            <h4 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#3d1f00", margin:"0 0 6px" }}>
              {dateMode==="go"?`Set availability — ${MN[month]} ${selected}`:`Book a date — ${MN[month]} ${selected}`}
            </h4>
            <p style={{ fontSize:12, color:"#a08060", margin:"0 0 14px" }}>
              {dateMode==="go"?"Pick activities you're open for on this day":"Confirm what you agreed in messages"}
            </p>
            {dateMode==="book" && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:13, color:"#6b4226", fontWeight:700, margin:"0 0 8px" }}>Duration</p>
                <div style={{ display:"flex", gap:8 }}>
                  {[1,2,3,4].map(h=>(
                    <button key={h} onClick={()=>setHours(h)} style={{ flex:1, padding:"8px 0", borderRadius:10, border:"1.5px solid", borderColor:hours===h?cfg.color:cfg.cardBorder, background:hours===h?cfg.gradient:"#fff", color:hours===h?"#fff":cfg.tagColor, fontWeight:700, cursor:"pointer" }}>{h}h</button>
                  ))}
                </div>
                <div style={{ marginTop:10, background:cfg.tagBg, borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, color:"#8a6040" }}>Estimated total</span>
                  <span style={{ fontSize:18, fontWeight:700, color:cfg.color, fontFamily:"'Playfair Display',Georgia,serif" }}>₹{350*hours}</span>
                </div>
              </div>
            )}
            <p style={{ fontSize:13, color:"#6b4226", fontWeight:700, margin:"0 0 8px" }}>Activity</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:16 }}>
              {ACTIVITIES.map(a=><button key={a} onClick={()=>setActivity(a)} style={{ padding:"6px 12px", borderRadius:20, border:"1.5px solid", borderColor:activity===a?cfg.color:cfg.tagBorder, background:activity===a?cfg.gradient:cfg.tagBg, color:activity===a?"#fff":cfg.tagColor, fontSize:12, cursor:"pointer" }}>{a}</button>)}
            </div>
            <button onClick={()=>{setShowBook(false);setSelected(null);alert(dateMode==="go"?`✅ Availability set! ${activity} on ${MN[month]} ${selected}`:`✅ Booked! ${activity} on ${MN[month]} ${selected} · ₹${350*hours} total`);}} style={{ width:"100%", padding:13, borderRadius:12, border:"none", background:cfg.gradient, color:"#fff", fontSize:15, fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, cursor:"pointer" }}>
              {dateMode==="go"?"Set Available ✓":"Confirm Booking 🎉"}
            </button>
          </div>
        )}
        <AdBanner idx={1} />
      </div>
    </div>
  );
}

function MyProfileScreen({ setScreen, dateMode, setDateMode, handleLogout }) {
  const cfg = MODE[dateMode];
  return (
    <div style={{ paddingBottom:80 }}>
      <div style={{ height:140, background:"linear-gradient(160deg,#f9e4cc,#f0c08a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:70, position:"relative" }}>
        🌟
        <button onClick={()=>setScreen(SCREENS.DISCOVER)} style={{ position:"absolute", top:18, left:18, background:"rgba(255,255,255,0.85)", border:"none", borderRadius:"50%", width:38, height:38, fontSize:18, cursor:"pointer" }}>←</button>
      </div>
      <div style={{ padding:"20px 20px" }}>
        {/* Big mode switcher */}
        <div style={{ background:"#fff", borderRadius:20, padding:18, border:`2px solid ${cfg.color}60`, marginBottom:20, boxShadow:`0 4px 20px ${cfg.color}20` }}>
          <p style={{ margin:"0 0 12px", fontSize:12, color:"#8a6040", fontWeight:700, textAlign:"center", letterSpacing:1 }}>YOUR MODE</p>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
            <ModeToggle dateMode={dateMode} setDateMode={setDateMode} />
          </div>
          <div style={{ background:cfg.tagBg, borderRadius:12, padding:"12px 14px", border:`1px solid ${cfg.tagBorder}` }}>
            {dateMode==="go"
              ? <p style={{ margin:0, fontSize:13, color:cfg.color, textAlign:"center", lineHeight:1.6 }}>💃 <strong>Go on a Date</strong><br/><span style={{ color:"#8a6040" }}>You appear to people looking to book someone. Set your hourly rate & availability below.</span></p>
              : <p style={{ margin:0, fontSize:13, color:cfg.color, textAlign:"center", lineHeight:1.6 }}>🕵️ <strong>Book a Date</strong><br/><span style={{ color:"#8a6040" }}>You browse companions & pay for dates. Your profile is hidden from the bookings feed.</span></p>
            }
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:26, color:"#3d1f00", margin:0 }}>Alex, 28</h2>
            <p style={{ color:"#c07040", fontSize:13, margin:"4px 0 8px" }}>📍 Warangal, Telangana</p>
            {dateMode==="go" && <span style={{ background:cfg.gradient, color:"#fff", borderRadius:20, padding:"5px 14px", fontSize:15, fontWeight:700, fontFamily:"'Playfair Display',Georgia,serif" }}>₹400 / hour</span>}
          </div>
          <button onClick={()=>setScreen(SCREENS.EDIT_PROFILE)} style={{ background:"#fff5ec", border:"1.5px solid #f0c49a", borderRadius:12, padding:"8px 14px", fontSize:13, color:"#b05a20", cursor:"pointer" }}>✏️ Edit</button>
        </div>

        <p style={{ color:"#5a3010", lineHeight:1.7, fontSize:15, margin:"12px 0" }}>Coffee enthusiast and movie buff. Looking for someone to share adventures with.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
          {["☕ Coffee","🎬 Movie","🏞️ Hike"].map(a=><span key={a} style={{ background:cfg.tagBg, border:`1.5px solid ${cfg.tagBorder}`, borderRadius:20, padding:"6px 14px", fontSize:14, color:cfg.tagColor }}>{a}</span>)}
        </div>
        <div style={{ background:"#fff", borderRadius:16, padding:16, border:`1px solid ${cfg.cardBorder}`, marginBottom:16 }}>
          <h4 style={{ color:"#3d1f00", fontFamily:"'Playfair Display',Georgia,serif", margin:"0 0 10px" }}>📊 Stats</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, textAlign:"center" }}>
            {[["12","Matches"],["5","Dates done"],["4.9⭐","Rating"]].map(([v,l])=>(
              <div key={l}><div style={{ fontSize:22, fontWeight:700, color:cfg.color, fontFamily:"'Playfair Display',Georgia,serif" }}>{v}</div><div style={{ fontSize:11, color:"#c09070" }}>{l}</div></div>
            ))}
          </div>
        </div>
        <AdBanner idx={2} />
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: 14,
            marginTop: 20,
            borderRadius: 12,
            background: "#fee2e2",
            color: "#ef4444",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Logout from App
        </button>
      </div>
    </div>
  );
}

function EditProfileScreen({ setScreen, dateMode, setDateMode }) {
  const [bio, setBio] = useState("Coffee enthusiast and movie buff.");
  const [selected, setSelected] = useState(["☕ Coffee","🎬 Movie","🏞️ Hike"]);
  const [rate, setRate] = useState(400);
  const cfg = MODE[dateMode];
  return (
    <div style={{ paddingBottom:80 }}>
      <div style={{ padding:"20px 18px 12px", background:cfg.bg, display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={()=>setScreen(SCREENS.MY_PROFILE)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#c07040" }}>←</button>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:22, color:"#3d1f00", margin:0 }}>Edit Profile</h2>
      </div>
      <div style={{ padding:"16px 18px" }}>
        <div style={{ background:"#fff", borderRadius:20, padding:18, border:`1.5px solid ${cfg.color}50`, marginBottom:14 }}>
          <p style={{ margin:"0 0 10px", fontSize:13, color:"#8a6040", fontWeight:700 }}>Switch your mode anytime</p>
          <ModeToggle dateMode={dateMode} setDateMode={setDateMode} />
        </div>
        <div style={{ background:"#fff", borderRadius:20, padding:20, border:`1px solid ${cfg.cardBorder}`, marginBottom:14 }}>
          <label style={{ fontSize:13, color:"#a05020", fontWeight:700 }}>Profile Photos</label>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:10 }}>
            {["🌟","☕","🏔️"].map((e,i)=>(
              <div key={i} style={{ aspectRatio:"1", background:"linear-gradient(135deg,#f9e4cc,#f0c08a)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, cursor:"pointer", border:"2px dashed #f0c49a" }}>{e}</div>
            ))}
            <div style={{ aspectRatio:"1", background:"#fff5ec", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, cursor:"pointer", border:"2px dashed #f0c49a", color:"#c09070" }}>+</div>
          </div>
        </div>
        {dateMode==="go" && (
          <div style={{ background:"#fff", borderRadius:20, padding:20, border:`1px solid ${cfg.cardBorder}`, marginBottom:14 }}>
            <label style={{ fontSize:13, color:"#a05020", fontWeight:700 }}>💰 Your Hourly Rate</label>
            <p style={{ color:"#c09070", fontSize:12, margin:"4px 0 12px" }}>What you charge per hour. Be fair & transparent!</p>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:20, color:"#3d1f00", fontWeight:700 }}>₹</span>
              <input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} min={100} max={5000} step={50} style={{ flex:1, padding:"12px 14px", borderRadius:12, border:`1.5px solid ${cfg.tagBorder}`, fontSize:22, fontWeight:700, color:cfg.color, background:"#fffaf5", outline:"none", textAlign:"center", fontFamily:"'Playfair Display',Georgia,serif" }} />
              <span style={{ fontSize:15, color:"#a08060" }}>/ hr</span>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
              {[150,300,500,750,1000].map(p=><button key={p} onClick={()=>setRate(p)} style={{ padding:"5px 12px", borderRadius:16, border:"1.5px solid", borderColor:rate===p?cfg.color:cfg.tagBorder, background:rate===p?cfg.gradient:cfg.tagBg, color:rate===p?"#fff":cfg.tagColor, fontSize:13, cursor:"pointer" }}>₹{p}</button>)}
            </div>
            <div style={{ marginTop:12, background:cfg.tagBg, borderRadius:10, padding:"8px 12px", fontSize:12, color:"#a05020" }}>
              💡 2hr date → <strong>₹{rate*2}</strong> · 3hr date → <strong>₹{rate*3}</strong>
            </div>
          </div>
        )}
        <div style={{ background:"#fff", borderRadius:20, padding:20, border:`1px solid ${cfg.cardBorder}`, marginBottom:14 }}>
          <label style={{ fontSize:13, color:"#a05020", fontWeight:700 }}>Your Bio</label>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} style={{ width:"100%", marginTop:10, padding:"10px 12px", border:`1.5px solid ${cfg.tagBorder}`, borderRadius:12, fontSize:14, color:"#3d1f00", background:"#fffaf5", resize:"none", outline:"none", boxSizing:"border-box" }} />
        </div>
        <div style={{ background:"#fff", borderRadius:20, padding:20, border:`1px solid ${cfg.cardBorder}`, marginBottom:20 }}>
          <label style={{ fontSize:13, color:"#a05020", fontWeight:700 }}>Activities I enjoy</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:12 }}>
            {ACTIVITIES.map(a=>{
              const on=selected.includes(a);
              return <button key={a} onClick={()=>setSelected(s=>on?s.filter(x=>x!==a):[...s,a])} style={{ padding:"7px 14px", borderRadius:20, border:"1.5px solid", borderColor:on?cfg.color:cfg.tagBorder, background:on?cfg.gradient:cfg.tagBg, color:on?"#fff":cfg.tagColor, fontSize:13, cursor:"pointer" }}>{a}</button>;
            })}
          </div>
        </div>
        <button onClick={()=>setScreen(SCREENS.MY_PROFILE)} style={{ width:"100%", padding:14, borderRadius:14, border:"none", background:cfg.gradient, color:"#fff", fontSize:16, fontFamily:"'Playfair Display',Georgia,serif", fontWeight:700, cursor:"pointer" }}>Save Profile ✓</button>
      </div>
    </div>
  );
}

function BottomNav({ screen, setScreen, dateMode }) {
  const cfg = MODE[dateMode];
  const items = [{id:SCREENS.DISCOVER,icon:"🧭",label:"Discover"},{id:SCREENS.MESSAGES,icon:"💬",label:"Messages"},{id:SCREENS.CALENDAR,icon:"📅",label:"Calendar"},{id:SCREENS.MY_PROFILE,icon:"👤",label:"Me"}];
  if ([SCREENS.AUTH,SCREENS.CHAT].includes(screen)) return null;
  const current = screen===SCREENS.PROFILE?SCREENS.DISCOVER:screen===SCREENS.EDIT_PROFILE?SCREENS.MY_PROFILE:screen;
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"rgba(255,250,245,0.97)", backdropFilter:"blur(12px)", borderTop:`1px solid ${cfg.cardBorder}`, display:"flex", padding:"8px 0 12px", zIndex:100 }}>
      {items.map(item=>(
        <button key={item.id} onClick={()=>setScreen(item.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"4px 0" }}>
          <span style={{ fontSize:22, filter:current===item.id?"none":"grayscale(0.5) opacity(0.6)" }}>{item.icon}</span>
          <span style={{ fontSize:10, color:current===item.id?cfg.color:"#c09070", fontWeight:current===item.id?700:400 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.AUTH);
  const [viewProfile, setViewProfile] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const [dateMode, setDateMode] = useState("book");
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is already logged in when app loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setScreen(SCREENS.DISCOVER);
      }
    });

    // Listen for changes (Sign in / Sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) setScreen(SCREENS.AUTH);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setScreen(SCREENS.AUTH);
  };

  return (
    <div style={{ fontFamily:"Georgia,serif", maxWidth:430, margin:"0 auto", minHeight:"100vh", background:"#fffaf5", position:"relative", overflowX:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      {screen===SCREENS.AUTH        && <AuthScreen onLogin={(user) => { setCurrentUser(user); setScreen(SCREENS.DISCOVER); }} />}
      {screen===SCREENS.DISCOVER    && <DiscoverScreen setScreen={setScreen} setViewProfile={setViewProfile} dateMode={dateMode} setDateMode={setDateMode} />}
      {screen===SCREENS.PROFILE     && <ProfileScreen profile={viewProfile} setScreen={setScreen} dateMode={dateMode} />}
      {screen===SCREENS.MESSAGES    && <MessagesScreen setScreen={setScreen} setChatWith={setChatWith} dateMode={dateMode} />}
      {screen===SCREENS.CHAT        && <ChatScreen profile={chatWith||MOCK_PROFILES[0]} setScreen={setScreen} dateMode={dateMode} />}
      {screen===SCREENS.CALENDAR    && <CalendarScreen setScreen={setScreen} dateMode={dateMode} />}
      {screen===SCREENS.MY_PROFILE  && <MyProfileScreen setScreen={setScreen} dateMode={dateMode} setDateMode={setDateMode} handleLogout={handleLogout} currentUser={currentUser} />}
      {screen===SCREENS.EDIT_PROFILE && <EditProfileScreen setScreen={setScreen} dateMode={dateMode} setDateMode={setDateMode} />}
      <BottomNav screen={screen} setScreen={setScreen} dateMode={dateMode} />
    </div>
  );
}
