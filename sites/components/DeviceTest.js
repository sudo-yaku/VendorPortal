import { useEffect ,useState} from "react";
import { useSelector } from "react-redux";
import SamsungServerTest from "./SamsungServerTest";
import EricssonServerTest from "./EricssonServerTest";
import { List, Map } from "immutable"
import React from "react";
function DeviceTest(props) {
    const {loginId} = props
    const configData= useSelector(state => state.getIn(['Users', 'configData', 'configData'], List()))
    const user = useSelector(state => state.getIn(["Users", "entities", "users", loginId], Map()))
    const [vendorMarket, setVendorMarket] = useState("")
    const configObj = configData ? configData.toJS().configData : []

    useEffect(() => {
        if (configObj?.length > 0) {
            let samsungMarkets = configObj.find(item => ["SAMSUNG_MARKETS"].includes(item.ATTRIBUTE_NAME))
            let ericssonMarkets = configObj.find(item => ["ERICSSON_MARKETS"].includes(item.ATTRIBUTE_NAME))
            if (samsungMarkets?.ATTRIBUTE_VALUE.split(",").includes(user.get("vendor_region"))) {
                setVendorMarket("SAMSUNG_MARKETS")
            } else {
                if (ericssonMarkets?.ATTRIBUTE_VALUE.split(",").includes(user.get("vendor_region"))) {
                    setVendorMarket("ERICSSON_MARKETS")
                }
            }
        }
    }, [])
    return (
        <>
            {vendorMarket == "ERICSSON_MARKETS" && <EricssonServerTest selectedRow={props.selectedRow} notifref={props.notifref} loginId={props.loginId}  />}
            {vendorMarket == "SAMSUNG_MARKETS" && <SamsungServerTest selectedRow={props.selectedRow} notifref={props.notifref} loginId={props.loginId}  />}
        </>
    )

}
export default DeviceTest