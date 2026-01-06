import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPrbAnalyzer } from '../actions'
import { z } from 'zod'
import React from 'react'

const prb = z.object({
  DAY: z.string(),
  HR: z.number(),
  ENODEB: z.string(),
  RFBRANCHRX: z.number().optional(),
  pmRadioRecInterferencePwrBrPrb1: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb2: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb3: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb4: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb5: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb6: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb7: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb8: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb9: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb10: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb11: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb12: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb13: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb14: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb15: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb16: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb17: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb18: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb19: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb20: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb21: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb22: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb23: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb24: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb25: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb26: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb27: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb28: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb29: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb30: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb31: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb32: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb33: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb34: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb35: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb36: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb37: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb38: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb39: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb40: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb41: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb42: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb43: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb44: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb45: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb46: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb47: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb48: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb49: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb50: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb51: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb52: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb53: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb54: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb55: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb56: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb57: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb58: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb59: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb60: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb61: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb62: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb63: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb64: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb65: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb66: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb67: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb68: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb69: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb70: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb71: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb72: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb73: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb74: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb75: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb76: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb77: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb78: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb79: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb80: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb81: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb82: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb83: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb84: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb85: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb86: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb87: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb88: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb89: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb90: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb91: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb92: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb93: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb94: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb95: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb96: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb97: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb98: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb99: z.number().nullable(),
  pmRadioRecInterferencePwrBrPrb100: z.number().nullable(),
  RRC_SETUP_FAILURE_DEN: z.number().nullable(),
  RX1_DBM: z.string().nullable(),
  RX2_DBM: z.string().nullable(),
  RX3_DBM: z.string().nullable(),
  RX4_DBM: z.string().nullable()
})

const resultsSchema = z.record(
  z.string(),
  z.object({
    vendor: z.string(),
    data: z.object({
      freq: z
        .array(
          z.object({
            Block: z.string(),
            BW: z.number(),
            prb1: z.string(),
            prb2: z.string(),
            prb3: z.string(),
            prb4: z.string(),
            prb5: z.string(),
            prb6: z.string(),
            prb7: z.string(),
            prb8: z.string(),
            prb9: z.string(),
            prb10: z.string(),
            prb11: z.string(),
            prb12: z.string(),
            prb13: z.string(),
            prb14: z.string(),
            prb15: z.string(),
            prb16: z.string(),
            prb17: z.string(),
            prb18: z.string(),
            prb19: z.string(),
            prb20: z.string(),
            prb21: z.string(),
            prb22: z.string(),
            prb23: z.string(),
            prb24: z.string(),
            prb25: z.string(),
            prb26: z.string(),
            prb27: z.string(),
            prb28: z.string(),
            prb29: z.string(),
            prb30: z.string(),
            prb31: z.string(),
            prb32: z.string(),
            prb33: z.string(),
            prb34: z.string(),
            prb35: z.string(),
            prb36: z.string(),
            prb37: z.string(),
            prb38: z.string(),
            prb39: z.string(),
            prb40: z.string(),
            prb41: z.string(),
            prb42: z.string(),
            prb43: z.string(),
            prb44: z.string(),
            prb45: z.string(),
            prb46: z.string(),
            prb47: z.string(),
            prb48: z.string(),
            prb49: z.string(),
            prb50: z.string(),
            prb51: z.string(),
            prb52: z.string(),
            prb53: z.string(),
            prb54: z.string(),
            prb55: z.string(),
            prb56: z.string(),
            prb57: z.string(),
            prb58: z.string(),
            prb59: z.string(),
            prb60: z.string(),
            prb61: z.string(),
            prb62: z.string(),
            prb63: z.string(),
            prb64: z.string(),
            prb65: z.string(),
            prb66: z.string(),
            prb67: z.string(),
            prb68: z.string(),
            prb69: z.string(),
            prb70: z.string(),
            prb71: z.string(),
            prb72: z.string(),
            prb73: z.string(),
            prb74: z.string(),
            prb75: z.string(),
            prb76: z.string(),
            prb77: z.string(),
            prb78: z.string(),
            prb79: z.string(),
            prb80: z.string(),
            prb81: z.string(),
            prb82: z.string(),
            prb83: z.string(),
            prb84: z.string(),
            prb85: z.string(),
            prb86: z.string(),
            prb87: z.string(),
            prb88: z.string(),
            prb89: z.string(),
            prb90: z.string(),
            prb91: z.string(),
            prb92: z.string(),
            prb93: z.string(),
            prb94: z.string(),
            prb95: z.string(),
            prb96: z.string(),
            prb97: z.string(),
            prb98: z.string(),
            prb99: z.string(),
            prb100: z.string()
          })
        )
        .optional(),
      prb1: z.array(prb).optional(),
      prb2: z.array(prb).optional(),
      prb3: z.array(prb).optional(),
      prb4: z.array(prb).optional(),
      prb5: z.array(prb).optional(),
      prb6: z.array(prb).optional(),
      prb7: z.array(prb).optional(),
      prb8: z.array(prb).optional(),
      sectorCarrier: z.array(prb).optional()
    })
  })
)


export function usePrbAnalyzerQuery(node) {
  const dispatch = useDispatch()
  const [prbAnalyzerData, setPrbAnalyzerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (node) {
      setLoading(true)
      setError(null)
      
      // Dispatch action and get promise
      dispatch(fetchPrbAnalyzer({ node }))
        .then((action) => {
          // Handle success - action.payload contains the data
          console.log("Node ID Value:", node)
          console.log("PRB Analyzer action:", action)
          if (action && action.payload) {
            setPrbAnalyzerData(action.payload)
          }
          setLoading(false)
        })
        .catch((err) => {
          // Handle error
          setError(err || "Failed to fetch PRB Analyzer data")
          setLoading(false)
        })
    }
  }, [node, dispatch])

  let data = undefined
  console.log("PRB Analyzer data:", prbAnalyzerData)
  if (prbAnalyzerData) {
    try {
      const enbMap = {}
      for (const map of prbAnalyzerData) {
        for (const enbId of Object.keys(map)) {
          enbMap[enbId] = map[enbId]
        }
      }
      data = enbMap
    } catch (e) {
      console.log("Error parsing PRB Analyzer data:", e)
    }
  }

  return {
    data,
    loading,
    error,
  }
}
