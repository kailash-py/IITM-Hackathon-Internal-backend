with open(r"C:\Users\DELL\Desktop\sih-hazard-system\src\App.jsx", "r", encoding="utf-8") as f:
    text = f.read()

replacements = [
    ("width: ${score}%", "width: `${score}%`"),
    ("map(([r,c]) => ${r},)", "map(([r,c]) => `${r},${c}`)"),
    ("startKey = routeData?.start ? ${routeData.start[0]}, : \"\"", "startKey = routeData?.start ? `${routeData.start[0]},${routeData.start[1]}` : \"\""),
    ("goalKey = routeData?.goal ? ${routeData.goal[0]}, : \"\"", "goalKey = routeData?.goal ? `${routeData.goal[0]},${routeData.goal[1]}` : \"\""),
    ("value: ${routeData.path_length} steps", "value: `${routeData.path_length} steps`"),
    ("value: ~ min", "value: `~${routeData.estimated_time_minutes} min`"),
    ("key = ${r},;", "key = `${r},${c}`;"),
    ("fetch(${API_BASE}/relocate/approve", "fetch(`${API_BASE}/relocate/approve`"),
    ("fetch(${API_BASE}/route/)", "fetch(`${API_BASE}/route/${incidentId.replace(\"#\", \"\")}`)"),
    ("fetch(${API_BASE}/dispatch", "fetch(`${API_BASE}/dispatch`"),
    ("alert(Dispatched  to !)", "alert(`Dispatched ${data.team.name} to ${data.incident.location}!`)"),
    ("fetch(${API_BASE}/teams)", "fetch(`${API_BASE}/teams`)"),
    ("fetch(${API_BASE}/incidents)", "fetch(`${API_BASE}/incidents`)"),
    ("fetch(${API_BASE}/stats)", "fetch(`${API_BASE}/stats`)"),
    ("fetch(${API_BASE}/habitations)", "fetch(`${API_BASE}/habitations`)"),
    ("sub: ${stats?.criticalCount || 0} Pending Relocation", "sub: `${stats?.criticalCount || 0} Pending Relocation`"),
    ("background: ${sc}22", "background: `${sc}22`")
]

for old, new in replacements:
    text = text.replace(old, new)

with open(r"C:\Users\DELL\Desktop\sih-hazard-system\src\App.jsx", "w", encoding="utf-8") as f:
    f.write(text)

print("App.jsx fixed successfully!")
