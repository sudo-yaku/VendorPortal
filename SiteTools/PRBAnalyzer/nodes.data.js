import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchNodes } from '../actions'
import { z } from 'zod'
import React from 'react'

const nodeSchema = z.object({
  node: z.string(),
  vendor: z.string(),
  type: z.string(),
  commandList: z.string(),
  enodeb_name: z.string()
})

const nodesSchema = z.object({
  nodes: z.array(nodeSchema)
})

export function useNodesQuery(siteUnid) {
  const dispatch = useDispatch()
  const [nodesData, setNodesData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (siteUnid) {
      setLoading(true)
      setError(null)
      
      // Dispatch action and get promise
      dispatch(fetchNodes({ siteUnid }))
        .then((action) => {
          // Handle success - action.payload contains the data
          if (action && action.payload) {
            setNodesData(action.payload)
          }
          setLoading(false)
        })
        .catch((err) => {
          // Handle error
          setError(err || "Failed to fetch nodes")
          setLoading(false)
        })
    }
  }, [siteUnid, dispatch])

  let data = undefined
  if (nodesData) {
    try {
      data = nodesSchema.parse({ nodes: nodesData })
    } catch (e) {
      console.log("Schema validation error:", e)
    }
  }

  return {
    data,
    loading,
    error,
  }
}
