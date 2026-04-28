import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── HELPER ───────────────────────────────────────────────────────────────
const P_ = (id,name,exp,imp,topExp,topImp) => ({id,name,exports:exp,imports:imp,topExports:topExp,topImports:topImp});

// ─── 20+ COUNTRIES PER YEAR — TOP 15 SELECTED DYNAMICALLY ────────────────
// Sources: PIB, DGCI&S, GTRI, Ministry of Commerce. Aggregates verified.
// Country-level: verified FY2022-23+, proportional estimates for older years.

const TRADE_BY_YEAR = {
"FY 2025-26": { label:"FY 2025-26", subtitle:"Apr 2025 – Mar 2026", tME:441.78, tMI:774.98, tSE:418.31, tSI:204.42, src:"PIB/DGCI&S (Apr 2026)", partners:[
  P_("us","United States",78.50,52.56,["Petroleum Products","Pharma","Gems & Jewellery","Electronics","Textiles"],["Machinery","Crude Oil","Electronics","Aircraft Parts","Chemicals"]),
  P_("cn","China",15.20,131.62,["Iron Ore","Organic Chemicals","Cotton","Seafood","Spices"],["Electronics","Machinery","Active Pharma","Chemicals","Auto Parts"]),
  P_("ae","UAE",34.80,59.10,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("ru","Russia",5.10,55.20,["Pharma","Machinery","Tea","Coffee","Tobacco"],["Crude Oil","Coal","Fertilizers","Diamonds","Sunflower Oil"]),
  P_("sa","Saudi Arabia",12.50,44.80,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Organic Chemicals","Plastics"]),
  P_("sg","Singapore",14.00,28.50,["Refined Fuel","Gems","Machinery","Pharma","Textiles"],["Electronics","Gold","Chemicals","Machinery","Refined Fuel"]),
  P_("iq","Iraq",3.80,28.20,["Pharma","Rice","Meat","Cereals","Textiles"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("id","Indonesia",8.20,22.80,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("kr","South Korea",10.10,22.50,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("hk","Hong Kong",8.40,21.30,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("nl","Netherlands",20.50,5.80,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Medical Instruments","Electronics"]),
  P_("de","Germany",11.00,18.90,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",13.50,11.50,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("my","Malaysia",6.50,17.80,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("jp","Japan",7.80,21.00,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",6.00,20.50,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Education Services"]),
  P_("ch","Switzerland",1.20,19.80,["Gems","Pharma","Organic Chemicals","Textiles","Engineering Goods"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("kw","Kuwait",2.80,16.50,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
  P_("bd","Bangladesh",14.10,2.10,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("ng","Nigeria",4.50,14.00,["Machinery","Vehicles","Pharma","Textiles","Rice"],["Crude Oil","LNG","Petroleum","Fertilizers","Chemicals"]),
]},
"FY 2024-25": { label:"FY 2024-25", subtitle:"Apr 2024 – Mar 2025", tME:437.42, tMI:720.24, tSE:383.51, tSI:194.95, src:"PIB/DGCI&S", partners:[
  P_("us","United States",76.38,45.33,["Petroleum Products","Gems & Jewellery","Pharma","Electronics","Textiles"],["Machinery","Crude Oil","Electronics","Aircraft Parts","Chemicals"]),
  P_("cn","China",14.25,113.45,["Iron Ore","Organic Chemicals","Cotton","Seafood","Spices"],["Electronics","Machinery","Active Pharma","Chemicals","Auto Parts"]),
  P_("ae","UAE",33.26,55.75,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("ru","Russia",4.80,58.29,["Pharma","Tea","Machinery","Coffee","Tobacco"],["Crude Oil","Coal","Fertilizers","Diamonds","Sunflower Oil"]),
  P_("sa","Saudi Arabia",12.10,41.62,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("sg","Singapore",13.17,26.82,["Refined Fuel","Gems","Machinery","Pharma","Textiles"],["Electronics","Gold","Chemicals","Machinery","Refined Fuel"]),
  P_("iq","Iraq",3.50,26.14,["Pharma","Rice","Meat","Cereals","Textiles"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("id","Indonesia",7.79,21.06,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("kr","South Korea",9.51,20.99,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("hk","Hong Kong",7.80,18.50,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("nl","Netherlands",21.01,5.20,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Medical Instruments","Electronics"]),
  P_("de","Germany",10.43,16.80,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",12.74,8.50,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("my","Malaysia",5.90,16.10,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("jp","Japan",7.20,19.48,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",5.50,19.42,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Education Services"]),
  P_("ch","Switzerland",1.10,18.50,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("kw","Kuwait",2.50,15.00,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
  P_("bd","Bangladesh",13.20,1.90,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
]},
"FY 2023-24": { label:"FY 2023-24", subtitle:"Apr 2023 – Mar 2024", tME:437.07, tMI:678.21, tSE:341.11, tSI:178.32, src:"Ministry of Commerce/GTRI", partners:[
  P_("us","United States",77.52,40.80,["Petroleum Products","Gems & Jewellery","Pharma","Electronics","Textiles"],["Machinery","Crude Oil","Electronics","Aircraft Parts","Chemicals"]),
  P_("cn","China",16.67,101.75,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Auto Parts"]),
  P_("ae","UAE",35.63,48.02,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("ru","Russia",4.26,61.43,["Pharma","Tea","Machinery","Coffee","Tobacco"],["Crude Oil","Coal","Fertilizers","Diamonds","Sunflower Oil"]),
  P_("sa","Saudi Arabia",11.56,31.81,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("sg","Singapore",14.41,21.20,["Refined Fuel","Gems","Machinery","Pharma","Textiles"],["Electronics","Gold","Chemicals","Machinery","Refined Fuel"]),
  P_("iq","Iraq",3.35,30.00,["Rice","Pharma","Meat","Cereals","Textiles"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("id","Indonesia",5.99,23.41,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("kr","South Korea",8.24,20.45,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("hk","Hong Kong",7.30,16.20,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("nl","Netherlands",22.37,4.97,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Medical Instruments","Electronics"]),
  P_("de","Germany",9.84,16.27,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",12.92,8.42,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("my","Malaysia",5.60,14.80,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("jp","Japan",7.94,16.16,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",5.16,17.70,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Education Services"]),
  P_("ch","Switzerland",1.00,17.20,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("bd","Bangladesh",11.80,1.60,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("kw","Kuwait",2.30,14.50,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
]},
"FY 2022-23": { label:"FY 2022-23", subtitle:"Apr 2022 – Mar 2023", tME:451.07, tMI:715.97, tSE:325.33, tSI:182.05, src:"Ministry of Commerce/PIB", partners:[
  P_("us","United States",78.31,50.24,["Petroleum Products","Gems & Jewellery","Pharma","Electronics","Textiles"],["Machinery","Crude Oil","Electronics","Aircraft Parts","Chemicals"]),
  P_("cn","China",15.32,98.51,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",31.30,44.86,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("ru","Russia",3.14,46.33,["Pharma","Tea","Machinery","Coffee","Textiles"],["Crude Oil","Coal","Fertilizers","Diamonds","Sunflower Oil"]),
  P_("sa","Saudi Arabia",11.01,42.06,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("sg","Singapore",10.96,19.10,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Machinery","Refined Fuel"]),
  P_("iq","Iraq",2.80,34.50,["Rice","Meat","Pharma","Cereals","Textiles"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("id","Indonesia",9.36,24.15,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("kr","South Korea",6.50,19.00,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("nl","Netherlands",18.40,5.00,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Medical Instruments","Electronics"]),
  P_("de","Germany",10.00,15.00,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",12.50,8.00,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("my","Malaysia",5.80,13.50,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("jp","Japan",6.00,16.00,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",5.50,17.50,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("ch","Switzerland",1.20,18.00,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("bd","Bangladesh",12.50,1.50,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("hk","Hong Kong",6.50,14.00,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("kw","Kuwait",2.20,14.00,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
  P_("ng","Nigeria",4.50,14.50,["Machinery","Vehicles","Pharma","Textiles","Rice"],["Crude Oil","LNG","Petroleum","Fertilizers","Chemicals"]),
]},
"FY 2021-22": { label:"FY 2021-22", subtitle:"Apr 2021 – Mar 2022", tME:417.81, tMI:610.22, tSE:254.50, tSI:147.00, src:"PIB/DGCI&S", partners:[
  P_("us","United States",76.11,43.31,["Petroleum Products","Gems","Pharma","Electronics","Textiles"],["Crude Oil","Machinery","Electronics","Aircraft Parts","Chemicals"]),
  P_("cn","China",21.26,94.16,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",28.32,44.60,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("sa","Saudi Arabia",8.76,34.08,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("iq","Iraq",2.10,31.00,["Rice","Pharma","Meat","Textiles","Cereals"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("sg","Singapore",8.60,21.50,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Machinery","Fuel"]),
  P_("id","Indonesia",6.80,19.00,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("ru","Russia",3.25,13.10,["Pharma","Tea","Machinery","Coffee","Textiles"],["Crude Oil","Coal","Fertilizers","Diamonds","Metals"]),
  P_("kr","South Korea",5.50,17.50,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("nl","Netherlands",12.70,3.90,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Medical Instruments","Electronics"]),
  P_("de","Germany",9.00,13.50,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",10.50,6.80,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("my","Malaysia",5.80,12.80,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("jp","Japan",6.30,13.00,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",4.50,14.80,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("ch","Switzerland",1.10,15.00,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("bd","Bangladesh",11.20,1.30,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("hk","Hong Kong",6.00,12.50,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("kw","Kuwait",2.10,12.00,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
  P_("be","Belgium",7.50,10.50,["Gems & Jewellery","Pharma","Chemicals","Iron & Steel","Textiles"],["Diamonds","Machinery","Chemicals","Pharma","Plastics"]),
]},
"FY 2020-21": { label:"FY 2020-21", subtitle:"Apr 2020 – Mar 2021 (COVID)", tME:291.81, tMI:394.44, tSE:206.09, tSI:122.78, src:"PIB/DGCI&S", partners:[
  P_("us","United States",51.62,29.00,["Pharma","Gems","Electronics","Textiles","Marine Products"],["Crude Oil","Machinery","Electronics","Chemicals","Plastics"]),
  P_("cn","China",21.19,65.21,["Iron Ore","Organic Chemicals","Cotton","Seafood","Rice"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",16.66,26.66,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("sa","Saudi Arabia",5.56,15.78,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("iq","Iraq",1.80,18.80,["Rice","Pharma","Meat","Textiles","Cereals"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("sg","Singapore",6.60,13.00,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Fuel","Machinery"]),
  P_("id","Indonesia",3.90,13.20,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("hk","Hong Kong",7.20,11.50,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("kr","South Korea",4.30,12.90,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("nl","Netherlands",8.50,3.00,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Instruments","Electronics"]),
  P_("de","Germany",7.60,11.30,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",8.20,4.90,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("my","Malaysia",4.50,9.50,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("jp","Japan",4.60,10.90,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",3.60,11.10,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("ch","Switzerland",1.00,11.00,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("bd","Bangladesh",8.60,1.10,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("be","Belgium",5.50,8.00,["Gems & Jewellery","Pharma","Chemicals","Iron & Steel","Textiles"],["Diamonds","Machinery","Chemicals","Pharma","Plastics"]),
  P_("ru","Russia",2.60,5.50,["Pharma","Tea","Machinery","Coffee","Textiles"],["Crude Oil","Coal","Fertilizers","Diamonds","Metals"]),
  P_("kw","Kuwait",1.50,7.00,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
]},
"FY 2019-20": { label:"FY 2019-20", subtitle:"Apr 2019 – Mar 2020", tME:313.36, tMI:474.71, tSE:213.20, tSI:131.50, src:"DGCI&S", partners:[
  P_("us","United States",52.40,36.30,["Pharma","Gems","Electronics","Textiles","Marine Products"],["Crude Oil","Machinery","Electronics","Chemicals","Aircraft"]),
  P_("cn","China",16.61,65.26,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",21.10,30.30,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("sa","Saudi Arabia",7.30,22.70,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("iq","Iraq",2.10,23.70,["Rice","Pharma","Meat","Textiles","Cereals"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("sg","Singapore",9.80,16.30,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Fuel","Machinery"]),
  P_("hk","Hong Kong",8.90,15.60,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("id","Indonesia",5.10,14.80,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("kr","South Korea",4.60,16.00,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("nl","Netherlands",9.60,3.30,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Instruments","Electronics"]),
  P_("de","Germany",8.50,13.00,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",9.30,5.90,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("my","Malaysia",5.50,11.00,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("jp","Japan",4.80,12.80,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",3.20,12.10,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("ch","Switzerland",1.10,16.50,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("bd","Bangladesh",9.20,1.20,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("be","Belgium",6.00,9.50,["Gems & Jewellery","Pharma","Chemicals","Iron & Steel","Textiles"],["Diamonds","Machinery","Chemicals","Pharma","Plastics"]),
  P_("ru","Russia",2.40,6.70,["Pharma","Tea","Machinery","Coffee","Textiles"],["Crude Oil","Coal","Fertilizers","Diamonds","Metals"]),
  P_("kw","Kuwait",2.00,9.00,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
  P_("ng","Nigeria",3.80,11.00,["Machinery","Vehicles","Pharma","Textiles","Rice"],["Crude Oil","LNG","Petroleum","Fertilizers","Chemicals"]),
]},
"FY 2018-19": { label:"FY 2018-19", subtitle:"Apr 2018 – Mar 2019", tME:330.08, tMI:514.08, tSE:208.00, tSI:127.00, src:"DGCI&S", partners:[
  P_("us","United States",52.41,36.26,["Pharma","Gems","Electronics","Textiles","Marine Products"],["Crude Oil","Machinery","Electronics","Chemicals","Aircraft"]),
  P_("cn","China",16.75,70.32,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",30.13,30.30,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("sa","Saudi Arabia",9.52,28.48,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("iq","Iraq",2.20,24.00,["Rice","Pharma","Meat","Textiles","Cereals"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("sg","Singapore",10.00,16.90,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Fuel","Machinery"]),
  P_("hk","Hong Kong",12.20,17.80,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("id","Indonesia",5.40,16.50,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("kr","South Korea",4.70,16.70,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("ch","Switzerland",1.30,18.00,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("de","Germany",8.90,14.40,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",9.30,6.10,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("nl","Netherlands",8.80,3.20,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Instruments","Electronics"]),
  P_("jp","Japan",4.90,12.80,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("au","Australia",3.30,13.00,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("my","Malaysia",6.00,10.60,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("bd","Bangladesh",9.80,1.00,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("be","Belgium",6.80,10.00,["Gems & Jewellery","Pharma","Chemicals","Iron & Steel","Textiles"],["Diamonds","Machinery","Chemicals","Pharma","Plastics"]),
  P_("kw","Kuwait",2.40,10.50,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
  P_("ru","Russia",2.10,7.40,["Pharma","Tea","Machinery","Coffee","Textiles"],["Crude Oil","Coal","Fertilizers","Diamonds","Metals"]),
  P_("ng","Nigeria",3.50,12.00,["Machinery","Vehicles","Pharma","Textiles","Rice"],["Crude Oil","LNG","Petroleum","Fertilizers","Chemicals"]),
]},
"FY 2017-18": { label:"FY 2017-18", subtitle:"Apr 2017 – Mar 2018", tME:303.53, tMI:465.58, tSE:195.00, tSI:118.00, src:"DGCI&S", partners:[
  P_("us","United States",47.88,26.61,["Pharma","Gems","Textiles","Electronics","Marine Products"],["Crude Oil","Machinery","Electronics","Chemicals","Aircraft"]),
  P_("cn","China",13.33,76.38,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",28.10,21.70,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("sa","Saudi Arabia",7.50,22.00,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("iq","Iraq",1.80,22.00,["Rice","Pharma","Meat","Textiles","Cereals"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("hk","Hong Kong",13.50,19.00,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("sg","Singapore",10.10,7.80,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Fuel","Machinery"]),
  P_("ch","Switzerland",1.20,19.50,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("id","Indonesia",4.60,16.20,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("kr","South Korea",4.40,16.40,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("de","Germany",8.40,13.30,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",9.30,5.80,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("nl","Netherlands",7.50,2.80,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Instruments","Electronics"]),
  P_("jp","Japan",4.70,10.40,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("my","Malaysia",5.80,10.40,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("au","Australia",2.70,11.50,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("bd","Bangladesh",9.00,0.90,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("be","Belgium",6.50,10.00,["Gems & Jewellery","Pharma","Chemicals","Iron & Steel","Textiles"],["Diamonds","Machinery","Chemicals","Pharma","Plastics"]),
  P_("ng","Nigeria",3.50,10.50,["Machinery","Vehicles","Pharma","Textiles","Rice"],["Crude Oil","LNG","Petroleum","Fertilizers","Chemicals"]),
  P_("kw","Kuwait",2.20,9.00,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
  P_("ru","Russia",2.20,6.20,["Pharma","Tea","Machinery","Coffee","Textiles"],["Crude Oil","Coal","Fertilizers","Diamonds","Metals"]),
]},
"FY 2016-17": { label:"FY 2016-17", subtitle:"Apr 2016 – Mar 2017", tME:275.85, tMI:384.36, tSE:163.00, tSI:96.00, src:"DGCI&S", partners:[
  P_("us","United States",42.21,22.30,["Pharma","Gems","Textiles","Electronics","Marine Products"],["Machinery","Electronics","Chemicals","Aircraft","Crude Oil"]),
  P_("cn","China",10.17,61.28,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",24.50,21.00,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("sa","Saudi Arabia",6.40,18.30,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("ch","Switzerland",1.10,19.80,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("iq","Iraq",1.50,16.80,["Rice","Pharma","Meat","Textiles","Cereals"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("hk","Hong Kong",12.00,16.50,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("sg","Singapore",8.80,7.40,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Fuel","Machinery"]),
  P_("kr","South Korea",4.20,13.50,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("id","Indonesia",4.30,13.40,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("de","Germany",7.20,11.20,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",8.70,5.40,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("jp","Japan",3.90,9.80,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("nl","Netherlands",6.50,2.50,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Instruments","Electronics"]),
  P_("my","Malaysia",5.50,8.50,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("au","Australia",2.40,10.50,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("bd","Bangladesh",6.80,0.70,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("be","Belgium",5.80,8.50,["Gems & Jewellery","Pharma","Chemicals","Iron & Steel","Textiles"],["Diamonds","Machinery","Chemicals","Pharma","Plastics"]),
  P_("ng","Nigeria",3.00,9.00,["Machinery","Vehicles","Pharma","Textiles","Rice"],["Crude Oil","LNG","Petroleum","Fertilizers","Chemicals"]),
  P_("kw","Kuwait",2.10,7.50,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
]},
"FY 2015-16": { label:"FY 2015-16", subtitle:"Apr 2015 – Mar 2016", tME:262.29, tMI:381.01, tSE:154.00, tSI:89.00, src:"DGCI&S", partners:[
  P_("us","United States",40.30,21.80,["Pharma","Gems","Textiles","Electronics","Marine Products"],["Machinery","Electronics","Chemicals","Aircraft","Crude Oil"]),
  P_("cn","China",9.02,61.71,["Iron Ore","Organic Chemicals","Cotton","Seafood","Granite"],["Electronics","Machinery","Active Pharma","Chemicals","Telecom"]),
  P_("ae","UAE",21.50,20.00,["Petroleum Products","Gems & Jewellery","Rice","Textiles","Machinery"],["Crude Oil","Gold","Petroleum","Chemicals","Machinery"]),
  P_("sa","Saudi Arabia",6.40,19.40,["Rice","Textiles","Machinery","Chemicals","Iron & Steel"],["Crude Oil","LPG","Fertilizers","Chemicals","Plastics"]),
  P_("ch","Switzerland",0.90,18.00,["Gems","Pharma","Organic Chemicals","Textiles","Machinery"],["Gold","Watches","Pharma","Machinery","Chemicals"]),
  P_("iq","Iraq",1.30,14.00,["Rice","Pharma","Meat","Textiles","Cereals"],["Crude Oil","Crude Oil","Crude Oil","Crude Oil","Crude Oil"]),
  P_("hk","Hong Kong",10.50,14.00,["Gems & Jewellery","Electronics","Textiles","Pharma","Machinery"],["Gold","Electronics","Pearls","Machinery","Watches"]),
  P_("sg","Singapore",8.50,7.10,["Refined Fuel","Gems","Machinery","Pharma","Electronics"],["Electronics","Gold","Chemicals","Fuel","Machinery"]),
  P_("kr","South Korea",3.50,13.10,["Steel","Aluminium","Marine Products","Textiles","Chemicals"],["Semiconductors","Auto Parts","Steel","Machinery","Plastics"]),
  P_("id","Indonesia",3.80,13.80,["Petroleum Products","Iron & Steel","Vehicles","Machinery","Chemicals"],["Palm Oil","Coal","Minerals","Rubber","Paper"]),
  P_("de","Germany",7.00,11.50,["Textiles","Pharma","Auto Parts","Chemicals","Leather"],["Auto Parts","Machinery","Chemicals","Electronics","Iron & Steel"]),
  P_("gb","United Kingdom",8.90,5.20,["Pharma","Gems","Textiles","Machinery","Chemicals"],["Machinery","Precious Metals","Chemicals","Vehicles","Beverages"]),
  P_("jp","Japan",3.60,9.50,["Marine Products","Iron Ore","Textiles","Chemicals","Petroleum"],["Auto Parts","Machinery","Iron & Steel","Electronics","Plastics"]),
  P_("nl","Netherlands",5.80,2.30,["Petroleum Products","Pharma","Chemicals","Electronics","Iron & Steel"],["Machinery","Chemicals","Dairy","Instruments","Electronics"]),
  P_("my","Malaysia",4.80,8.80,["Petroleum Products","Aluminium","Electronics","Chemicals","Rice"],["Palm Oil","Electronics","LNG","Chemicals","Rubber"]),
  P_("au","Australia",2.20,10.00,["Pharma","Gems","Engineering Goods","Textiles","Rice"],["Coal","LNG","Gold","Aluminium","Wool"]),
  P_("bd","Bangladesh",6.10,0.60,["Cotton","Textiles","Vehicles","Machinery","Iron & Steel"],["Textiles","Jute","Fish","Leather","Frozen Food"]),
  P_("be","Belgium",5.20,8.80,["Gems & Jewellery","Pharma","Chemicals","Iron & Steel","Textiles"],["Diamonds","Machinery","Chemicals","Pharma","Plastics"]),
  P_("ng","Nigeria",2.80,9.50,["Machinery","Vehicles","Pharma","Textiles","Rice"],["Crude Oil","LNG","Petroleum","Fertilizers","Chemicals"]),
  P_("kw","Kuwait",2.30,6.50,["Rice","Textiles","Machinery","Pharma","Chemicals"],["Crude Oil","LPG","Petroleum","Chemicals","Fertilizers"]),
]},
};

const YEARS=Object.keys(TRADE_BY_YEAR);
const EC={r:0,g:229,b:190},IC={r:255,g:107,b:53},NC={r:255,g:176,b:46};
function c(o,a=1){return`rgba(${o.r},${o.g},${o.b},${a})`;}
function getTop15(partners){return[...partners].sort((a,b)=>(b.exports+b.imports)-(a.exports+a.imports)).slice(0,15);}

class Pt{constructor(pi,sp,isE){this.pi=pi;this.t=Math.random();this.sp=sp*(0.5+Math.random());this.isE=isE;this.sz=1.2+Math.random()*2;this.a=0.5+Math.random()*0.5;}up(dt){this.t+=this.sp*dt;if(this.t>1)this.t-=1;}}
function bz(p,t){const u=1-t;return{x:u*u*u*p.sx+3*u*u*t*p.c1x+3*u*t*t*p.c2x+t*t*t*p.ex,y:u*u*u*p.sy+3*u*u*t*p.c1y+3*u*t*t*p.c2y+t*t*t*p.ey};}

// ─── CANVAS FLAG LIBRARY (22 countries) ──────────────────────────────────
function drawFlag(ctx,id,x,y,w,h){
  const h3=h/3,h2=h/2,w2=w/2,w3=w/3;
  switch(id){
    case"us":for(let i=0;i<13;i++){ctx.fillStyle=i%2===0?"#B22234":"#fff";ctx.fillRect(x,y+i*h/13,w,h/13);}ctx.fillStyle="#3C3B6E";ctx.fillRect(x,y,w*0.4,h*0.54);ctx.fillStyle="#fff";ctx.font=`${h*0.11}px serif`;for(let r=0;r<3;r++)for(let cc=0;cc<3;cc++)ctx.fillText("★",x+w*0.05+cc*w*0.12,y+h*0.08+r*h*0.15);break;
    case"cn":ctx.fillStyle="#DE2910";ctx.fillRect(x,y,w,h);ctx.fillStyle="#FFDE00";ctx.font=`bold ${h*0.38}px serif`;ctx.fillText("★",x+w*0.08,y+h*0.42);break;
    case"ae":ctx.fillStyle="#00732F";ctx.fillRect(x,y,w,h3);ctx.fillStyle="#fff";ctx.fillRect(x,y+h3,w,h3);ctx.fillStyle="#000";ctx.fillRect(x,y+h3*2,w,h3);ctx.fillStyle="#FF0000";ctx.fillRect(x,y,w*0.25,h);break;
    case"ru":ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h3);ctx.fillStyle="#0039A6";ctx.fillRect(x,y+h3,w,h3);ctx.fillStyle="#D52B1E";ctx.fillRect(x,y+h3*2,w,h3);break;
    case"sa":ctx.fillStyle="#006C35";ctx.fillRect(x,y,w,h);ctx.fillStyle="#fff";ctx.font=`bold ${h*0.22}px serif`;ctx.textAlign="center";ctx.fillText("☪",x+w2,y+h*0.5);break;
    case"sg":ctx.fillStyle="#EF3340";ctx.fillRect(x,y,w,h2);ctx.fillStyle="#fff";ctx.fillRect(x,y+h2,w,h2);ctx.fillStyle="#fff";ctx.font=`${h*0.2}px serif`;ctx.textAlign="center";ctx.fillText("☪",x+w*0.25,y+h*0.28);break;
    case"iq":ctx.fillStyle="#CE1126";ctx.fillRect(x,y,w,h3);ctx.fillStyle="#fff";ctx.fillRect(x,y+h3,w,h3);ctx.fillStyle="#000";ctx.fillRect(x,y+h3*2,w,h3);break;
    case"id":ctx.fillStyle="#FF0000";ctx.fillRect(x,y,w,h2);ctx.fillStyle="#fff";ctx.fillRect(x,y+h2,w,h2);break;
    case"kr":ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.beginPath();ctx.arc(x+w2,y+h2,h*0.25,0,Math.PI,true);ctx.fillStyle="#CD2E3A";ctx.fill();ctx.beginPath();ctx.arc(x+w2,y+h2,h*0.25,0,Math.PI,false);ctx.fillStyle="#0047A0";ctx.fill();break;
    case"nl":ctx.fillStyle="#AE1C28";ctx.fillRect(x,y,w,h3);ctx.fillStyle="#fff";ctx.fillRect(x,y+h3,w,h3);ctx.fillStyle="#21468B";ctx.fillRect(x,y+h3*2,w,h3);break;
    case"de":ctx.fillStyle="#000";ctx.fillRect(x,y,w,h3);ctx.fillStyle="#DD0000";ctx.fillRect(x,y+h3,w,h3);ctx.fillStyle="#FFCC00";ctx.fillRect(x,y+h3*2,w,h3);break;
    case"gb":ctx.fillStyle="#012169";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#fff";ctx.lineWidth=h*0.08;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y+h);ctx.moveTo(x+w,y);ctx.lineTo(x,y+h);ctx.stroke();ctx.strokeStyle="#C8102E";ctx.lineWidth=h*0.04;ctx.stroke();ctx.strokeStyle="#fff";ctx.lineWidth=h*0.14;ctx.beginPath();ctx.moveTo(x+w2,y);ctx.lineTo(x+w2,y+h);ctx.moveTo(x,y+h2);ctx.lineTo(x+w,y+h2);ctx.stroke();ctx.strokeStyle="#C8102E";ctx.lineWidth=h*0.08;ctx.beginPath();ctx.moveTo(x+w2,y);ctx.lineTo(x+w2,y+h);ctx.moveTo(x,y+h2);ctx.lineTo(x+w,y+h2);ctx.stroke();break;
    case"jp":ctx.fillStyle="#fff";ctx.fillRect(x,y,w,h);ctx.beginPath();ctx.arc(x+w2,y+h2,h*0.28,0,Math.PI*2);ctx.fillStyle="#BC002D";ctx.fill();break;
    case"au":ctx.fillStyle="#012169";ctx.fillRect(x,y,w,h);ctx.fillStyle="#fff";ctx.font=`${h*0.28}px serif`;ctx.textAlign="center";ctx.fillText("★",x+w*0.25,y+h*0.58);ctx.font=`${h*0.14}px serif`;ctx.fillText("✦",x+w*0.7,y+h*0.3);ctx.fillText("✦",x+w*0.8,y+h*0.55);break;
    case"hk":ctx.fillStyle="#DE2910";ctx.fillRect(x,y,w,h);ctx.fillStyle="#fff";ctx.font=`${h*0.4}px serif`;ctx.textAlign="center";ctx.fillText("✿",x+w2,y+h*0.58);break;
    case"my":ctx.fillStyle="#010066";ctx.fillRect(x,y,w,h*0.5);ctx.fillStyle="#CC0001";ctx.fillRect(x,y+h*0.5,w,h*0.5);for(let i=0;i<14;i++){ctx.fillStyle=i%2===0?"#CC0001":"#fff";ctx.fillRect(x,y+i*h/14,w,h/14);}ctx.fillStyle="#010066";ctx.fillRect(x,y,w*0.4,h*0.5);ctx.fillStyle="#FC0";ctx.font=`${h*0.2}px serif`;ctx.textAlign="center";ctx.fillText("☪",x+w*0.2,y+h*0.3);break;
    case"ch":ctx.fillStyle="#D52B1E";ctx.fillRect(x,y,w,h);ctx.fillStyle="#fff";ctx.fillRect(x+w*0.4,y+h*0.2,w*0.2,h*0.6);ctx.fillRect(x+w*0.2,y+h*0.4,w*0.6,h*0.2);break;
    case"bd":ctx.fillStyle="#006a4e";ctx.fillRect(x,y,w,h);ctx.beginPath();ctx.arc(x+w*0.45,y+h2,h*0.3,0,Math.PI*2);ctx.fillStyle="#f42a41";ctx.fill();break;
    case"be":ctx.fillStyle="#000";ctx.fillRect(x,y,w3,h);ctx.fillStyle="#FAE042";ctx.fillRect(x+w3,y,w3,h);ctx.fillStyle="#ED2939";ctx.fillRect(x+w3*2,y,w3,h);break;
    case"kw":ctx.fillStyle="#007A3D";ctx.fillRect(x,y,w,h3);ctx.fillStyle="#fff";ctx.fillRect(x,y+h3,w,h3);ctx.fillStyle="#CE1126";ctx.fillRect(x,y+h3*2,w,h3);ctx.fillStyle="#000";ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w*0.25,y+h2);ctx.lineTo(x,y+h);ctx.fill();break;
    case"ng":ctx.fillStyle="#008751";ctx.fillRect(x,y,w3,h);ctx.fillStyle="#fff";ctx.fillRect(x+w3,y,w3,h);ctx.fillStyle="#008751";ctx.fillRect(x+w3*2,y,w3,h);break;
    default:ctx.fillStyle="rgba(100,140,180,0.4)";ctx.fillRect(x,y,w,h);ctx.fillStyle="#fff";ctx.font=`bold ${h*0.3}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(id.toUpperCase(),x+w2,y+h2);
  }
}

function makeTicker(yd,pd,top15){const m=[];top15.forEach(curr=>{const prev=pd?.partners?.find(p=>p.id===curr.id);if(prev){const ec=((curr.exports-prev.exports)/prev.exports*100).toFixed(1);const ic=((curr.imports-prev.imports)/prev.imports*100).toFixed(1);if(Math.abs(ec)>2)m.push(`Exports to ${curr.name} ${ec>0?"rose":"fell"} ${Math.abs(ec)}% → $${curr.exports}B`);if(Math.abs(ic)>2)m.push(`Imports from ${curr.name} ${ic>0?"rose":"fell"} ${Math.abs(ic)}% → $${curr.imports}B`);}else{const bal=curr.exports-curr.imports;m.push(`${curr.name}: $${(curr.exports+curr.imports).toFixed(1)}B total trade`);}});return m.length?m:top15.map(p=>`${p.name} total: $${(p.exports+p.imports).toFixed(1)}B`);}

export default function App(){
  const cvRef=useRef(null),boxRef=useRef(null),animRef=useRef(null);
  const R=useRef({nodes:[],paths:[],parts:[],cx:0,cy:0,w:0,h:0,hv:-1,fc:-1,time:0});
  const[yr,setYr]=useState("FY 2025-26");const[tip,setTip]=useState(null);const[foc,setFoc]=useState(null);
  const[ti,setTi]=useState(0);const[tf,setTf]=useState(true);const[trans,setTrans]=useState(false);const[ddOpen,setDdOpen]=useState(false);
  const yd=TRADE_BY_YEAR[yr];const pi=YEARS.indexOf(yr)+1;const pd=pi<YEARS.length?TRADE_BY_YEAR[YEARS[pi]]:null;
  const top15=useMemo(()=>getTop15(yd.partners),[yd.partners]);
  const ticks=useMemo(()=>makeTicker(yd,pd,top15),[yd,pd,top15]);
  useEffect(()=>{const iv=setInterval(()=>{setTf(false);setTimeout(()=>{setTi(i=>(i+1)%ticks.length);setTf(true);},400);},4000);return()=>clearInterval(iv);},[ticks.length]);

  const doLayout=useCallback((w,h,pts)=>{const s=R.current;s.w=w;s.h=h;s.cx=w*0.5;s.cy=h*0.52;const rad=Math.min(w,h)*0.33;const trades=pts.map(d=>d.exports+d.imports);const minT=Math.min(...trades),maxT=Math.max(...trades);
    s.nodes=pts.map((d,i)=>{const a=(i/pts.length)*Math.PI*2-Math.PI/2;const norm=maxT>minT?((d.exports+d.imports)-minT)/(maxT-minT):0.5;return{x:s.cx+Math.cos(a)*rad,y:s.cy+Math.sin(a)*rad,data:d,r:20+norm*12};});
    s.paths=s.nodes.map(n=>{const dx=n.x-s.cx,dy=n.y-s.cy,mx=(n.x+s.cx)/2,my=(n.y+s.cy)/2;return{sx:s.cx,sy:s.cy,ex:n.x,ey:n.y,c1x:mx-dy*0.25,c1y:my+dx*0.25,c2x:mx+dy*0.075,c2y:my-dx*0.075};});
    s.parts=[];s.nodes.forEach((n,i)=>{const tot=n.data.exports+n.data.imports;const cnt=Math.floor(6+tot/10),er=n.data.exports/tot;for(let j=0;j<cnt;j++)s.parts.push(new Pt(i,0.06+Math.random()*0.06,j<cnt*er));});
  },[]);

  useEffect(()=>{const box=boxRef.current;if(!box)return;const r=box.getBoundingClientRect();R.current.hv=-1;R.current.fc=-1;setFoc(null);setTip(null);setTrans(true);setTimeout(()=>setTrans(false),500);doLayout(r.width,r.height,top15);},[yr,doLayout,top15]);

  useEffect(()=>{const cv=cvRef.current,box=boxRef.current;if(!cv||!box)return;const ctx=cv.getContext("2d");const dpr=window.devicePixelRatio||1;
    const resize=()=>{const r=box.getBoundingClientRect();cv.width=r.width*dpr;cv.height=r.height*dpr;cv.style.width=r.width+"px";cv.style.height=r.height+"px";ctx.setTransform(dpr,0,0,dpr,0,0);doLayout(r.width,r.height,top15);};
    resize();window.addEventListener("resize",resize);let last=performance.now();
    const draw=(now)=>{const dt=Math.min((now-last)/1000,0.05);last=now;const s=R.current;s.time+=dt;ctx.clearRect(0,0,s.w,s.h);
      const bg=ctx.createRadialGradient(s.cx,s.cy,0,s.cx,s.cy,s.w*0.7);bg.addColorStop(0,"#0a0f1a");bg.addColorStop(0.5,"#060a12");bg.addColorStop(1,"#020408");ctx.fillStyle=bg;ctx.fillRect(0,0,s.w,s.h);
      ctx.strokeStyle="rgba(255,255,255,0.012)";ctx.lineWidth=0.5;for(let x=0;x<s.w;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,s.h);ctx.stroke();}for(let y=0;y<s.h;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(s.w,y);ctx.stroke();}
      s.paths.forEach((p,i)=>{const n=s.nodes[i],hv=s.hv===i,fc=s.fc===i,dim=s.fc>=0&&!fc;const tot=n.data.exports+n.data.imports,lw=1+Math.log(tot)*0.5;
        ctx.beginPath();ctx.moveTo(p.sx,p.sy);ctx.bezierCurveTo(p.c1x,p.c1y,p.c2x,p.c2y,p.ex,p.ey);ctx.strokeStyle=c(EC,dim?0.03:hv||fc?0.55:0.12);ctx.lineWidth=lw*(n.data.exports/tot)*2.5;ctx.stroke();
        ctx.beginPath();ctx.moveTo(p.sx+2,p.sy+2);ctx.bezierCurveTo(p.c1x+2,p.c1y+2,p.c2x+2,p.c2y+2,p.ex+2,p.ey+2);ctx.strokeStyle=c(IC,dim?0.03:hv||fc?0.55:0.12);ctx.lineWidth=lw*(n.data.imports/tot)*2.5;ctx.stroke();
        if(hv||fc){ctx.beginPath();ctx.moveTo(p.sx,p.sy);ctx.bezierCurveTo(p.c1x,p.c1y,p.c2x,p.c2y,p.ex,p.ey);ctx.strokeStyle=c(EC,0.1);ctx.lineWidth=lw*5;ctx.filter="blur(6px)";ctx.stroke();ctx.filter="none";}});
      s.parts.forEach(pt=>{pt.up(dt);if(s.fc>=0&&s.fc!==pt.pi)return;const path=s.paths[pt.pi];if(!path)return;const t=pt.isE?pt.t:1-pt.t,pos=bz(path,t);const col=pt.isE?EC:IC,hi=s.hv===pt.pi||s.fc===pt.pi;ctx.beginPath();ctx.arc(pos.x,pos.y,hi?pt.sz*1.4:pt.sz,0,Math.PI*2);ctx.fillStyle=c(col,hi?pt.a:pt.a*0.55);ctx.fill();ctx.beginPath();ctx.arc(pos.x,pos.y,(hi?pt.sz*1.4:pt.sz)*2.5,0,Math.PI*2);ctx.fillStyle=c(col,(hi?pt.a:pt.a*0.55)*0.12);ctx.fill();});
      // India center
      const pulse=1+Math.sin(s.time*2)*0.04,ir=38*pulse;const glow=ctx.createRadialGradient(s.cx,s.cy,ir*0.5,s.cx,s.cy,ir*3);glow.addColorStop(0,c(NC,0.1));glow.addColorStop(1,"transparent");ctx.fillStyle=glow;ctx.fillRect(s.cx-ir*3,s.cy-ir*3,ir*6,ir*6);
      ctx.beginPath();ctx.arc(s.cx,s.cy,ir+3,0,Math.PI*2);ctx.strokeStyle=c(NC,0.3+Math.sin(s.time*3)*0.1);ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.arc(s.cx,s.cy,ir,0,Math.PI*2);ctx.fillStyle="#0D1520";ctx.fill();ctx.strokeStyle="rgba(255,176,46,0.25)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.save();ctx.beginPath();ctx.arc(s.cx,s.cy,ir-2,0,Math.PI*2);ctx.clip();const fw=ir*2,fh=ir*2,fx=s.cx-fw/2,fy=s.cy-fh/2;
      ctx.fillStyle="#FF9933";ctx.fillRect(fx,fy,fw,fh/3);ctx.fillStyle="#fff";ctx.fillRect(fx,fy+fh/3,fw,fh/3);ctx.fillStyle="#138808";ctx.fillRect(fx,fy+fh*2/3,fw,fh/3);
      const cr=ir*0.2;ctx.beginPath();ctx.arc(s.cx,s.cy,cr,0,Math.PI*2);ctx.strokeStyle="#000080";ctx.lineWidth=1.5;ctx.stroke();for(let sp=0;sp<24;sp++){const ang=sp*Math.PI/12;ctx.beginPath();ctx.moveTo(s.cx+Math.cos(ang)*cr*0.3,s.cy+Math.sin(ang)*cr*0.3);ctx.lineTo(s.cx+Math.cos(ang)*cr*0.95,s.cy+Math.sin(ang)*cr*0.95);ctx.strokeStyle="#000080";ctx.lineWidth=0.7;ctx.stroke();}ctx.restore();
      ctx.fillStyle="#fff";ctx.font="bold 13px 'JetBrains Mono',monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("INDIA",s.cx,s.cy+ir+14);
      // Country nodes
      s.nodes.forEach((n,i)=>{const hv=s.hv===i,fc=s.fc===i,dim=s.fc>=0&&!fc;const alpha=dim?0.12:1,r=n.r*(hv||fc?1.15:1);
        if(hv||fc){const ng=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*3);ng.addColorStop(0,c(EC,0.08));ng.addColorStop(1,"transparent");ctx.fillStyle=ng;ctx.beginPath();ctx.arc(n.x,n.y,r*3,0,Math.PI*2);ctx.fill();}
        ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);const ng2=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r);ng2.addColorStop(0,`rgba(20,30,50,${alpha*0.9})`);ng2.addColorStop(1,`rgba(10,15,25,${alpha*0.95})`);ctx.fillStyle=ng2;ctx.fill();ctx.strokeStyle=hv||fc?c(EC,0.8):`rgba(100,140,180,${0.25*alpha})`;ctx.lineWidth=hv||fc?2:1;ctx.stroke();
        ctx.globalAlpha=alpha;ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,r*0.65,0,Math.PI*2);ctx.clip();drawFlag(ctx,n.data.id,n.x-r*0.55,n.y-r*0.36,r*1.1,r*0.72);ctx.restore();
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="bold 9px 'JetBrains Mono',monospace";ctx.fillStyle=`rgba(200,220,255,${0.85*alpha})`;ctx.fillText(n.data.name.length>12?n.data.name.slice(0,11)+"…":n.data.name,n.x,n.y+r+12);ctx.globalAlpha=1;});
      animRef.current=requestAnimationFrame(draw);};animRef.current=requestAnimationFrame(draw);
    return()=>{window.removeEventListener("resize",resize);cancelAnimationFrame(animRef.current);};
  },[doLayout,top15]);

  const onMove=useCallback((e)=>{const rect=cvRef.current.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;const s=R.current;let found=-1;
    for(let i=0;i<s.nodes.length;i++)if(Math.hypot(mx-s.nodes[i].x,my-s.nodes[i].y)<s.nodes[i].r+15){found=i;break;}
    if(found<0)for(let i=0;i<s.paths.length;i++){for(let t=0;t<=1;t+=0.025)if(Math.hypot(mx-bz(s.paths[i],t).x,my-bz(s.paths[i],t).y)<12){found=i;break;}if(found>=0)break;}
    s.hv=found;if(found>=0){const d=top15[found],prev=pd?.partners?.find(p=>p.id===d.id);setTip({x:e.clientX,y:e.clientY,data:d,prev});}else setTip(null);
  },[top15,pd]);
  const onClick=useCallback(()=>{const s=R.current;if(s.hv>=0){if(s.fc===s.hv){s.fc=-1;setFoc(null);}else{s.fc=s.hv;setFoc(top15[s.hv]);}}else{s.fc=-1;setFoc(null);}},[top15]);
  const mb=yd.tME-yd.tMI;const ob=(yd.tME+yd.tSE)-(yd.tMI+yd.tSI);

  return(<div ref={boxRef} style={{width:"100%",height:"100vh",position:"relative",overflow:"hidden",background:"#020408",fontFamily:"'JetBrains Mono','Fira Code',monospace"}}>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet"/>
    <canvas ref={cvRef} onMouseMove={onMove} onClick={(e)=>{onClick();setDdOpen(false);}} onMouseLeave={()=>{R.current.hv=-1;setTip(null);}} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",cursor:R.current.hv>=0?"pointer":"default",opacity:trans?0.3:1,transition:"opacity 0.5s ease"}}/>
    <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",zIndex:10}}>
      <div style={{pointerEvents:"none"}}><h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color:"#fff",margin:0,letterSpacing:3,textShadow:"0 0 30px rgba(255,176,46,0.3)"}}>INDIA TRADE FLOW</h1>
        <div style={{fontSize:10,color:"rgba(200,220,255,0.4)",marginTop:3,letterSpacing:2,textTransform:"uppercase"}}>Top 15 bilateral partners · {yd.subtitle}</div>
        <div style={{fontSize:9,color:"rgba(200,220,255,0.25)",marginTop:2,letterSpacing:1}}>Source: {yd.src}</div>
        <div style={{display:"flex",gap:12,alignItems:"center",marginTop:8}}><DL color={c(EC)} label="Exports"/><DL color={c(IC)} label="Imports"/></div></div>
      <div style={{position:"relative",pointerEvents:"auto"}}><button onClick={()=>setDdOpen(!ddOpen)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(8,12,24,0.85)",border:"1px solid rgba(0,229,190,0.3)",borderRadius:8,padding:"8px 14px",cursor:"pointer",backdropFilter:"blur(12px)",boxShadow:ddOpen?"0 0 20px rgba(0,229,190,0.1)":"none"}}><span style={{fontSize:11,fontWeight:700,color:c(EC),fontFamily:"'JetBrains Mono',monospace"}}>{yr}</span><span style={{fontSize:9,color:c(EC,0.6),transform:ddOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▼</span></button>
        {ddOpen&&<div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"rgba(8,12,24,0.95)",border:"1px solid rgba(100,140,180,0.2)",borderRadius:8,overflow:"hidden",zIndex:30,minWidth:150,backdropFilter:"blur(16px)",boxShadow:"0 8px 32px rgba(0,0,0,0.6)",maxHeight:380,overflowY:"auto"}}>{YEARS.map(y=><button key={y} onClick={()=>{setYr(y);setTi(0);setDdOpen(false);}} style={{display:"block",width:"100%",textAlign:"left",background:y===yr?"rgba(0,229,190,0.1)":"transparent",border:"none",borderBottom:"1px solid rgba(100,140,180,0.08)",color:y===yr?c(EC):"rgba(200,220,255,0.6)",padding:"9px 14px",cursor:"pointer",fontSize:11,fontWeight:y===yr?700:400,fontFamily:"'JetBrains Mono',monospace"}} onMouseEnter={e=>{if(y!==yr)e.target.style.background="rgba(255,255,255,0.04)";}} onMouseLeave={e=>{e.target.style.background=y===yr?"rgba(0,229,190,0.1)":"transparent";}}>{y===yr&&<span style={{marginRight:6,fontSize:8}}>●</span>}{y}</button>)}</div>}</div></div>
    <div style={{position:"absolute",bottom:56,left:18,display:"flex",gap:6,flexWrap:"wrap",zIndex:10,pointerEvents:"none"}}>
      <SB l="Merch. Exports" v={`$${yd.tME.toFixed(1)}B`} col={EC}/><SB l="Merch. Imports" v={`$${yd.tMI.toFixed(1)}B`} col={IC}/><SB l="Merch. Deficit" v={`$${Math.abs(mb).toFixed(1)}B`} col={IC}/><SB l="Overall Balance" v={`${ob>=0?"+":"-"}$${Math.abs(ob).toFixed(1)}B`} col={ob>=0?EC:IC} sub="(incl. services)"/></div>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:36,display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(to right,rgba(0,229,190,0.04),transparent,rgba(255,107,53,0.04))",borderTop:"1px solid rgba(100,140,180,0.08)",zIndex:10,pointerEvents:"none"}}>
      <div style={{display:"flex",alignItems:"center",flex:1}}><div style={{padding:"0 12px",fontSize:9,color:c(EC,0.6),letterSpacing:2,fontWeight:700,borderRight:"1px solid rgba(100,140,180,0.12)",height:36,display:"flex",alignItems:"center",minWidth:46}}>▶ LIVE</div><div style={{padding:"0 14px",fontSize:11,color:"rgba(200,220,255,0.6)",transition:"opacity 0.4s",opacity:tf?1:0}}>{ticks[ti%ticks.length]}</div></div>
      <div style={{fontSize:10,color:"rgba(200,220,255,0.35)",fontFamily:"'JetBrains Mono',monospace",paddingRight:20,whiteSpace:"nowrap"}}>Made with <span style={{color:"#ff4757",fontSize:12}}>♥</span> by <span style={{color:"rgba(200,220,255,0.65)",fontWeight:700}}>ChoiceCoder</span></div></div>
    {tip&&!foc&&<TB d={tip.data} prev={tip.prev} x={tip.x} y={tip.y}/>}
    {foc&&<FP d={foc} prev={pd?.partners?.find(p=>p.id===foc.id)} close={()=>{R.current.fc=-1;setFoc(null);}} yl={yd.label}/>}
    <div style={{position:"absolute",bottom:40,right:18,fontSize:8,color:"rgba(200,220,255,0.25)",letterSpacing:1,zIndex:10,pointerEvents:"none"}}>HOVER to inspect · CLICK to focus</div>
    <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}@media(max-width:639px){@keyframes slideIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,229,190,0.2);border-radius:2px}`}</style>
  </div>);
}

function DL({color,label}){return<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`}}/><span style={{fontSize:10,color:"rgba(200,220,255,0.5)",letterSpacing:1,textTransform:"uppercase"}}>{label}</span></div>;}
function SB({l,v,col,sub}){return<div style={{background:"rgba(8,12,24,0.85)",border:"1px solid rgba(100,140,180,0.1)",borderRadius:7,padding:"8px 12px",minWidth:90,backdropFilter:"blur(12px)"}}><div style={{fontSize:8,color:"rgba(200,220,255,0.4)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}}>{l}</div><div style={{fontSize:15,fontWeight:700,color:c(col),fontFamily:"'Orbitron',sans-serif",textShadow:`0 0 16px ${c(col,0.3)}`}}>{v}</div>{sub&&<div style={{fontSize:8,color:"rgba(200,220,255,0.25)",marginTop:1}}>{sub}</div>}</div>;}

function TB({d,prev,x,y}){const ec=prev?((d.exports-prev.exports)/prev.exports*100).toFixed(1):null;const ic=prev?((d.imports-prev.imports)/prev.imports*100).toFixed(1):null;const bal=d.exports-d.imports;
  return<div style={{position:"fixed",left:Math.min(x+16,window.innerWidth-260),top:Math.max(y-10,10),background:"rgba(8,12,24,0.95)",border:"1px solid rgba(100,140,180,0.2)",borderRadius:8,padding:"12px 16px",zIndex:100,backdropFilter:"blur(12px)",minWidth:210,boxShadow:"0 8px 32px rgba(0,0,0,0.6)",pointerEvents:"none"}}>
    <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:8}}>{d.name}</div>
    <TR l="Exports" v={`$${d.exports}B`} ch={ec} col={EC}/><TR l="Imports" v={`$${d.imports}B`} ch={ic} col={IC}/>
    <div style={{marginTop:6,paddingTop:6,borderTop:"1px solid rgba(100,140,180,0.1)",fontSize:10,color:"rgba(200,220,255,0.5)"}}>Balance: <span style={{color:bal>=0?c(EC):c(IC),fontWeight:700}}>{bal>=0?"+":""}${bal.toFixed(1)}B</span> ({bal>=0?"Surplus":"Deficit"})</div>
    <div style={{marginTop:4,fontSize:9,color:"rgba(200,220,255,0.3)"}}>Click for details</div></div>;}
function TR({l,v,ch,col}){return<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontSize:11,color:"rgba(200,220,255,0.5)"}}>{l}</span><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:13,fontWeight:700,color:c(col)}}>{v}</span>{ch!==null&&<span style={{fontSize:9,fontWeight:600,color:ch>=0?c(EC):c(IC)}}>{ch>=0?"▲":"▼"}{Math.abs(ch)}%</span>}</div></div>;}

function FP({d,prev,close,yl}){const ec=prev?((d.exports-prev.exports)/prev.exports*100).toFixed(1):null;const ic=prev?((d.imports-prev.imports)/prev.imports*100).toFixed(1):null;const bal=d.exports-d.imports,tot=d.exports+d.imports,pct=(d.exports/tot*100).toFixed(0);
  const isMobile=typeof window!=="undefined"&&window.innerWidth<640;
  return<div style={{position:"absolute",
    ...(isMobile?{bottom:38,left:8,right:8,top:"auto",width:"auto",maxHeight:"55vh"}:{top:68,right:18,width:270,maxHeight:"calc(100vh - 140px)"}),
    background:"rgba(8,12,24,0.96)",border:"1px solid rgba(100,140,180,0.15)",borderRadius:12,padding:"16px",zIndex:50,backdropFilter:"blur(16px)",boxShadow:"0 12px 48px rgba(0,0,0,0.5)",animation:"slideIn 0.3s ease",pointerEvents:"auto",overflowY:"auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{d.name}</div><button onClick={close} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",borderRadius:6,width:24,height:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>✕</button></div>
    <div style={{fontSize:9,color:"rgba(200,220,255,0.35)",letterSpacing:1,marginBottom:8}}>{yl} · Merchandise</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}><MC l="Exports" v={`$${d.exports}B`} ch={ec} col={EC}/><MC l="Imports" v={`$${d.imports}B`} ch={ic} col={IC}/></div>
    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10,border:"1px solid rgba(100,140,180,0.08)",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"rgba(200,220,255,0.4)",marginBottom:3}}><span>Exp {pct}%</span><span>Imp {100-pct}%</span></div>
      <div style={{height:5,borderRadius:3,overflow:"hidden",display:"flex",background:"rgba(255,255,255,0.05)"}}><div style={{width:`${pct}%`,background:`linear-gradient(90deg,${c(EC)},${c(EC,0.6)})`,borderRadius:3}}/><div style={{flex:1,background:`linear-gradient(90deg,${c(IC,0.6)},${c(IC)})`,borderRadius:3}}/></div>
      <div style={{marginTop:5,fontSize:10,color:"rgba(200,220,255,0.5)"}}>Balance: <span style={{color:bal>=0?c(EC):c(IC),fontWeight:700}}>{bal>=0?"+":""}${bal.toFixed(1)}B</span> ({bal>=0?"Surplus":"Deficit"})</div></div>
    {/* TOP 5 EXPORTS */}
    <div style={{marginBottom:8}}>
      <div style={{fontSize:8,color:c(EC,0.5),letterSpacing:1.5,textTransform:"uppercase",marginBottom:5,fontWeight:700}}>Top 5 Exports</div>
      {d.topExports.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
        <span style={{fontSize:9,color:c(EC,0.35),fontWeight:700,minWidth:14}}>{i+1}.</span>
        <span style={{fontSize:10,color:"rgba(200,220,255,0.7)"}}>{item}</span>
      </div>)}
    </div>
    {/* TOP 5 IMPORTS */}
    <div>
      <div style={{fontSize:8,color:c(IC,0.5),letterSpacing:1.5,textTransform:"uppercase",marginBottom:5,fontWeight:700}}>Top 5 Imports</div>
      {d.topImports.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
        <span style={{fontSize:9,color:c(IC,0.35),fontWeight:700,minWidth:14}}>{i+1}.</span>
        <span style={{fontSize:10,color:"rgba(200,220,255,0.7)"}}>{item}</span>
      </div>)}
    </div>
    <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(100,140,180,0.08)",fontSize:10,color:"rgba(200,220,255,0.4)"}}>Total Trade: <span style={{color:"#fff",fontWeight:700}}>${tot.toFixed(1)}B</span></div>
  </div>;}
function MC({l,v,ch,col}){return<div style={{background:"rgba(255,255,255,0.03)",borderRadius:7,padding:"7px 9px",border:"1px solid rgba(100,140,180,0.08)"}}><div style={{fontSize:8,color:"rgba(200,220,255,0.4)",letterSpacing:1,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:c(col),marginTop:2}}>{v}</div>{ch!==null&&<div style={{fontSize:9,marginTop:1,fontWeight:600,color:ch>=0?c(EC):c(IC)}}>{ch>=0?"▲":"▼"} {Math.abs(ch)}% YoY</div>}</div>;}
