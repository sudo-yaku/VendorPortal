 const dispatch = useDispatch();
    const loginId = useSelector(state => state.getIn(["Users", "currentUser", "loginId"], ""));
    const user = useSelector(state => state.getIn(['Users', 'entities', 'users', loginId]));
    const region = user && user.get('vendor_region');
    
    // SCENARIO TRACKING: What comes from Redux
    const sites = useSelector(state => state.getIn(["Sites", loginId, "sitesbysubmarket", "sites"], []));
    console.log('🔍 [Redux Read] sites reference:', sites);
    console.log('🔍 [Redux Read] Is Immutable?', sites && typeof sites.toJS === 'function');
    
    // SCENARIO TRACKING: When does .toJS() run?
    const sitesList = useMemo(() => {
        console.log('⚡ [useMemo sitesList] EXECUTING - Converting Immutable to JS');
        const result = sites && sites.toJS ? sites.toJS() : [];
        console.log('⚡ [useMemo sitesList] Result length:', result.length);
        return result;
    }, [sites]);
    
    console.log('📦 [sitesList] Array reference:', sitesList);


// Filter by site name or site id
    // SCENARIO TRACKING: When does filter run?
    const filteredSites = useMemo(() => {
        console.log('🔎 [useMemo filteredSites] EXECUTING - Filtering sites');
        console.log('🔎 [useMemo filteredSites] searchVal:', searchVal);
        console.log('🔎 [useMemo filteredSites] sitesList length:', sitesList.length);
        
        if (!searchVal) {
            console.log('🔎 [useMemo filteredSites] No search - returning full sitesList');
            return sitesList;
        }
        
        const filtered = sitesList.filter(
            site =>
                (site.site_name && site.site_name.toLowerCase().includes(searchVal.toLowerCase())) ||
                (site.site_id && site.site_id.toLowerCase().includes(searchVal.toLowerCase()))
        );
        console.log('🔎 [useMemo filteredSites] Filtered result length:', filtered.length);
        return filtered;
    }, [sitesList, searchVal]);

    console.log('📊 [filteredSites] Final array reference:', filteredSites);
    console.log('------- RENDER COMPLETE -------\n');


    Without useMemo - The Problem:
    // ❌ WITHOUT useMemo
const sitesList = sites && sites.toJS ? sites.toJS() : [];

// Every render, this line executes:
// 1. Modal opens → component re-renders
// 2. sites.toJS() is called AGAIN (expensive!)
// 3. Creates a NEW array [site1, site2, ...] (new memory allocation)
// 4. Even though sites data is EXACTLY the same

const filteredSites = useMemo(() => {
    // sitesList is a NEW array reference
    // This triggers filteredSites to recalculate
    // Even though searchVal didn't change!
    return sitesList.filter(...)
}, [sitesList, searchVal]);  // ← sitesList changed (new reference)


With useMemo - The Solution:

// ✅ WITH useMemo
const sitesList = useMemo(() => {
    console.log('⚡ This only runs when sites changes');
    return sites && sites.toJS ? sites.toJS() : [];
}, [sites]);  // ← sites from Redux hasn't changed!

// 1. Modal opens → component re-renders
// 2. useMemo checks: did 'sites' change? NO!
// 3. Returns cached array (same reference as before)
// 4. No .toJS() call, no new array allocation

🔍 [Redux Read] sites reference: Immutable.List(size: 150)
🔍 [Redux Read] Is Immutable? true
⚡ [Converting] sites.toJS() called  ← UNNECESSARY!
📦 [sitesList] Array reference: Array(150) [...]  ← NEW ARRAY
🔎 [useMemo filteredSites] EXECUTING - Filtering sites  ← UNNECESSARY!
🔎 [useMemo filteredSites] searchVal: "Tower"
🔎 [useMemo filteredSites] sitesList length: 150
📊 [filteredSites] Final array reference: Array(42) [...]  ← NEW ARRAY
------- RENDER COMPLETE -------

💰 Cost: Expensive .toJS() + Array filtering
⏱️ Time: ~10-50ms (depending on data size)


🔍 [Redux Read] sites reference: Immutable.List(size: 150)
🔍 [Redux Read] Is Immutable? true
📦 [sitesList] Array reference: Array(150) [...]  ← SAME CACHED ARRAY
📊 [filteredSites] Final array reference: Array(42) [...]  ← SAME CACHED ARRAY
------- RENDER COMPLETE -------

💰 Cost: Nothing - both caches hit!
⏱️ Time: <1ms
