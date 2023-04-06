import axios from 'axios';
//https://circleci.com/blog/making-http-requests-with-axios/

//api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`;


/* useEffect(() => {
  (async () => {
    const { data } = await api.get('/users');

    setUsers(data);
  })();
}, []); */

const gasId =
  "AKfycbxzrwdy9gfW8uRz4TTOkN3kzgD5mANDPVnkbSr7bOav5WkNvtP1bHPuFEhG8jPtpNR08Q";

axios.defaults.headers.post['Content-Type'] ='application/json';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';


export const url = `https://script.google.com/macros/s/${gasId}/exec`

const serialize = async function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

export const query = async (payload) =>{
  return "?" + await serialize(payload)
}


const base =  axios.create({
  baseURL: `https://script.google.com/macros/s/${gasId}/exec`,
});


function get(table) {
  return new Promise((resolve, reject) => {
    console.log('executando a query...')



    axios.get(`https://script.google.com/macros/s/${gasId}/exec`,{
        params: {
          method: 'list',
          table: table,
        },
      })
      .then((res) => {
        return resolve(res.data);
      })
      .catch((err) => {
        console.log(err)
        return reject(err);
      });
  });
}


export function insertData (table, data) {
  return new Promise((resolve, reject) => {
    console.log('executing insert ...', data)

    axios.post(`https://script.google.com/macros/s/${gasId}/exec`, data,{ 
    crossdomain: true,
    params: {
      table:table
    }})
    .then((res) => {
        if(res.status == 200){
          return resolve(res.status)
         } else {
          return reject(res);
        }
        
      })
      .catch((err) => {
        console.log(err)
        return reject(err);
      });
  });
} 

export function fetchData (table, data) {
  // Simple POST request with a JSON body using fetch
  console.log('executing fetch ...', data)
  const requestOptions = {
      redirect: "follow",
      method: 'POST',
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      table:table,
      body: JSON.stringify(data)
  };
  const res = fetch(`https://script.google.com/macros/s/${gasId}/exec?`+table, requestOptions)
      .then(response => response.json())
      .catch((err) => {
        console.log(err)
        return err
      });

  console.log('fetch response', res)
}

export const fetchQuery = async (body) => {
  const requestOptions = (objBody) => {
    return {
      redirect: "follow",
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(objBody),
    };
  };

  const response = await fetch(url, requestOptions(body));
  return await response.json();
};



export default {
  get,
  fetchQuery
}