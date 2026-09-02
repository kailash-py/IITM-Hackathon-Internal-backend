export const HABS = [
  { id:'H01',n:'Raini Gaon',blk:'Joshimath',lat:30.4021,lng:79.5518,pop:3240,hh:648,ch:742,eld:466,vul:1208,risk:92,haz:94,vln:84,exp:88,inf:71,acc:'Poor',conf:89,cap:1900,pri:'P1',ver:'Verified',apr:'Approved',hazards:{Flood:91,Landslide:94,Cloudburst:84,Earthquake:41,Cyclone:4,Coastal:0} },
  { id:'H02',n:'Tapovan Tok',blk:'Joshimath',lat:30.4820,lng:79.6200,pop:2870,hh:574,ch:631,eld:402,vul:1033,risk:87,haz:88,vln:79,exp:83,inf:64,acc:'Moderate',conf:86,cap:1640,pri:'P1',ver:'In progress',apr:'Pending',hazards:{Flood:88,Landslide:81,Cloudburst:79,Earthquake:38,Cyclone:3,Coastal:0} },
  { id:'H03',n:'Bhyundar',blk:'Ghat',lat:30.6300,lng:79.5900,pop:1980,hh:396,ch:436,eld:277,vul:713,risk:81,haz:79,vln:82,exp:74,inf:58,acc:'Poor',conf:83,cap:1420,pri:'P2',ver:'Assigned',apr:'Draft',hazards:{Flood:64,Landslide:86,Cloudburst:77,Earthquake:44,Cyclone:2,Coastal:0} },
  { id:'H04',n:'Gauchar Khal',blk:'Karnaprayag',lat:30.2900,lng:79.4400,pop:5120,hh:1024,ch:1126,eld:717,vul:1843,risk:74,haz:71,vln:69,exp:81,inf:66,acc:'Good',conf:88,cap:4300,pri:'P2',ver:'Assigned',apr:'Draft',hazards:{Flood:79,Landslide:58,Cloudburst:66,Earthquake:39,Cyclone:3,Coastal:0} },
  { id:'H05',n:'Nandanagar',blk:'Ghat',lat:30.5200,lng:79.5000,pop:4460,hh:892,ch:981,eld:625,vul:1606,risk:68,haz:64,vln:71,exp:69,inf:60,acc:'Moderate',conf:81,cap:3900,pri:'P3',ver:'Not started',apr:'—',hazards:{Flood:57,Landslide:72,Cloudburst:61,Earthquake:36,Cyclone:2,Coastal:0} },
  { id:'H06',n:'Pipalkoti',blk:'Joshimath',lat:30.4300,lng:79.5100,pop:3610,hh:722,ch:794,eld:506,vul:1300,risk:61,haz:58,vln:63,exp:64,inf:57,acc:'Good',conf:84,cap:3400,pri:'P3',ver:'Not started',apr:'—',hazards:{Flood:52,Landslide:66,Cloudburst:55,Earthquake:34,Cyclone:2,Coastal:0} },
  { id:'H07',n:'Gopeshwar Bnd',blk:'Chamoli',lat:30.4100,lng:79.3300,pop:6840,hh:1368,ch:1505,eld:958,vul:2463,risk:54,haz:49,vln:58,exp:61,inf:44,acc:'Good',conf:87,cap:6900,pri:'P4',ver:'Not started',apr:'—',hazards:{Flood:46,Landslide:51,Cloudburst:48,Earthquake:33,Cyclone:2,Coastal:0} },
  { id:'H08',n:'Mandal Valley',blk:'Chamoli',lat:30.4500,lng:79.3700,pop:2240,hh:448,ch:493,eld:314,vul:807,risk:47,haz:42,vln:52,exp:49,inf:41,acc:'Moderate',conf:79,cap:2600,pri:'P4',ver:'Not started',apr:'—',hazards:{Flood:39,Landslide:47,Cloudburst:44,Earthquake:31,Cyclone:1,Coastal:0} },
  { id:'H09',n:'Sonala',blk:'Karnaprayag',lat:30.2700,lng:79.4100,pop:1560,hh:312,ch:343,eld:219,vul:562,risk:38,haz:34,vln:44,exp:37,inf:39,acc:'Good',conf:82,cap:2100,pri:'P4',ver:'Not started',apr:'—',hazards:{Flood:33,Landslide:36,Cloudburst:35,Earthquake:29,Cyclone:1,Coastal:0} },
  { id:'H10',n:'Dungri',blk:'Ghat',lat:30.5400,lng:79.4800,pop:980,hh:196,ch:216,eld:137,vul:353,risk:29,haz:26,vln:37,exp:28,inf:35,acc:'Good',conf:80,cap:1500,pri:'P4',ver:'Not started',apr:'—',hazards:{Flood:24,Landslide:31,Cloudburst:27,Earthquake:28,Cyclone:1,Coastal:0} },
]

export const CAPDET = {
  H01: { Housing: 2400, Water: 1900, Healthcare: 2150, Emergency: 2050, Access: 2600 },
  H02: { Housing: 2100, Water: 1640, Healthcare: 1880, Emergency: 1720, Access: 2300 },
  H03: { Housing: 1800, Water: 1610, Healthcare: 1420, Emergency: 1550, Access: 1490 },
  H04: { Housing: 5200, Water: 4300, Healthcare: 4700, Emergency: 4450, Access: 5600 },
  H05: { Housing: 4600, Water: 3900, Healthcare: 4200, Emergency: 4050, Access: 4800 },
  H06: { Housing: 4100, Water: 3400, Healthcare: 3900, Emergency: 3600, Access: 4400 },
  H07: { Housing: 8200, Water: 6900, Healthcare: 7400, Emergency: 7100, Access: 8800 },
  H08: { Housing: 3100, Water: 2600, Healthcare: 2900, Emergency: 2750, Access: 3300 },
  H09: { Housing: 2500, Water: 2100, Healthcare: 2300, Emergency: 2200, Access: 2700 },
  H10: { Housing: 1800, Water: 1500, Healthcare: 1650, Emergency: 1580, Access: 1900 },
}

export const DRIVERS = {
  H01: [['Rainfall intensity (72 h accumulation)',24],['Distance to river channel',21],['Population exposure in hazard polygon',16],['Road-link vulnerability',12],['Historical landslide recurrence',9],['Slope angle > 30°',6],['Building-material fragility',4]],
  H02: [['Rainfall intensity (72 h accumulation)',22],['Distance to river channel',19],['Slope angle > 30°',15],['Population exposure in hazard polygon',14],['Road-link vulnerability',10],['Historical landslide recurrence',7]],
  H03: [['Slope angle > 30°',26],['Historical landslide recurrence',18],['Road-link vulnerability',16],['Rainfall intensity (72 h accumulation)',12],['Elderly & child share of population',9]],
}

export const SITES = [
  { id:'S1',n:'Gopeshwar Relief Campus',lat:30.4100,lng:79.3300,dist:5.2,cap:4200,used:1400,risk:'Low',acc:'Good',health:2.1,water:'Piped, 24 h',suit:92 },
  { id:'S2',n:'Karnaprayag ITI Ground',lat:30.2600,lng:79.4200,dist:8.4,cap:5100,used:1200,risk:'Very low',acc:'Excellent',health:1.4,water:'Piped, 24 h',suit:89 },
  { id:'S3',n:'Pipalkoti School Block',lat:30.4300,lng:79.5100,dist:4.1,cap:900,used:500,risk:'Low',acc:'Poor',health:6.8,water:'Tanker only',suit:61 },
  { id:'S4',n:'Chamoli Stadium Shelter',lat:30.4000,lng:79.3200,dist:11.6,cap:3600,used:400,risk:'Low',acc:'Good',health:3.2,water:'Piped, 18 h',suit:78 },
]

export const TEAMS = [
  { id:'NDRF-07',n:'NDRF Bn-7 Alpha',lat:30.38,lng:79.34,st:'Available',ppl:32,eta:null },
  { id:'SDRF-02',n:'SDRF Chamoli-2',lat:30.46,lng:79.48,st:'En route',ppl:18,eta:14 },
  { id:'SDRF-05',n:'SDRF Ghat-5',lat:30.53,lng:79.52,st:'Available',ppl:16,eta:null },
  { id:'NDRF-11',n:'NDRF Bn-7 Bravo',lat:30.44,lng:79.36,st:'On site',ppl:28,eta:0 },
]

export const FAMILIES = [
  { id:'F102',size:5,found:4,shelter:'S1',members:[
    { n:'Prakash Rawat',a:44,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Kamla Rawat',a:41,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Sunita Rawat',a:19,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Aarti Rawat',a:9,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Rahul Rawat',a:16,st:'Missing',loc:'—' },
  ],match:{ n:'R. Rawat, ~16 M',conf:94,at:'Karnaprayag ITI Ground',by:'SDRF-02 intake, 11:42' }},
  { id:'F118',size:3,found:3,shelter:'S2',members:[
    { n:'Devendra Negi',a:52,st:'Safe',loc:'Karnaprayag ITI Ground' },
    { n:'Bhagwati Negi',a:48,st:'Safe',loc:'Karnaprayag ITI Ground' },
    { n:'Mohit Negi',a:21,st:'Safe',loc:'Karnaprayag ITI Ground' },
  ],match:null },
  { id:'F131',size:6,found:4,shelter:'S1',members:[
    { n:'Harish Bisht',a:38,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Rekha Bisht',a:35,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Anil Bisht',a:14,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Pooja Bisht',a:11,st:'Safe',loc:'Gopeshwar Relief Campus' },
    { n:'Girish Bisht',a:67,st:'Missing',loc:'—' },
    { n:'Savitri Bisht',a:63,st:'Missing',loc:'—' },
  ],match:{ n:'Elderly male, ~65 M, unidentified',conf:71,at:'Chamoli Stadium Shelter',by:'Medical intake, 13:07' }},
]

export const NOTIFS = [
  { sev:'crit',t:'Raini Gaon crossed critical risk',m:'Composite risk 92. Rainfall driver rose 18 points in 6 h.',w:'4 min ago',go:'ai' },
  { sev:'crit',t:'Road NH-7 Helang–Joshimath blocked',m:'Debris reported by SDRF-02. Routing re-computed for 3 missions.',w:'12 min ago',go:'route' },
  { sev:'warn',t:'Tapovan Tok field verification overdue',m:'Assigned 3 days ago to S. Bisht. Checklist 4 of 6 complete.',w:'1 h ago',go:'verify' },
  { sev:'warn',t:'Pipalkoti School Block near capacity',m:'500 of 900 places used. Suitability dropped to 61%.',w:'2 h ago',go:'safesites' },
  { sev:'info',t:'Relocation proposal awaiting approval',m:'Raini Gaon P1 proposal is with the District Authority.',w:'3 h ago',go:'approval' },
  { sev:'info',t:'Possible family match, F102',m:'94% confidence. Needs human verification before contact.',w:'4 h ago',go:'family' },
  { sev:'info',t:'Risk model retrained',m:'v2.4.1 · recall on landslide class improved 0.79 → 0.83.',w:'Yesterday',go:'dataai' },
]

export const AUDIT = [
  ['13:41','R. Negi','Approved relocation proposal RP-2026-0117 (Raini Gaon, P1)'],
  ['13:22','S. Bisht','Submitted field verification FV-0442 with 6 photos, GPS 30.4021N 79.5518E'],
  ['12:58','system','Composite risk for Raini Gaon recalculated 88 → 92'],
  ['12:40','Insp. Rawat','Dispatched SDRF-02 to incident INC-0091'],
  ['11:42','system','Person record created at Karnaprayag ITI Ground intake'],
  ['09:15','Sys. Admin','Ingested GSI landslide susceptibility layer, vintage 2025-Q4'],
]

export const HAZARD_WEIGHTS = { Flood: 0.28, Landslide: 0.30, Cloudburst: 0.22, Earthquake: 0.12, Cyclone: 0.04, Coastal: 0.04 }
