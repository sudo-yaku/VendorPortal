export const getAlarmQuery=`query($site_unid:String!){
    getAlarm(site_unid:$site_unid){
      alarms {
        alertid
        amo_name
        description
        correlates_count
        count
        created
        updated
        severity
        name
        manager_name
        site_unid
        siteid
        cell_number
        site_name
        switch
        source
        alarmsource
        remedyticket
        device_name
        group_name
        techid
      }
      unmapped_alarms {
        amo_name
        description
        created
        updated
        severity
        market
        enodeb_id
        name
        manager_name
      }
    }
  }`;