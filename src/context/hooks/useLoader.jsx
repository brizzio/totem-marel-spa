import React from 'react'

const useLoader = () => {

    const [loading, setLoading] = React.useState(false)

    const change = (value) => setLoading(value)
  
    const Render = ()=>{
        return(
            <div>Loading from Loader...</div>
        )
        
    }

  return (
    {loading, change, Render}
  )
}

export default useLoader