import React from 'react'
import { useMutation } from '@tanstack/react-query'

const usePoster = ({buttonTitle, table, payload}) => {
    const requestOptions = (objBody) => {
        return {
          redirect: "follow",
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(objBody),
        };
      };
    
      const mutation = useMutation({
        mutationFn: (body) =>
          fetch(url, requestOptions(body)).then((response) => response.json()),
      });
    
      return (
        <div>
          {mutation.isLoading ? (
            "Saving data to Database..."
          ) : (
            <>
              {mutation.isError ? (
                <div>An error occurred: {mutation.error.message}</div>
              ) : null}
    
              {mutation.isSuccess ? <div>Success!!!</div> : null}
    
              <button
                onClick={() => {
                  mutation.mutate({
                    table: table,
                    payload: payload,
                  });
                }}
              >
                {buttonTitle}
              </button>
            </>
          )}
        </div>
      );
}

export default usePoster