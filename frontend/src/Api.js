
const BASE = "https://growth-within.onrender.com";

export const api = {
  get: (url) =>                    //whenever the get req, it comes over here from api.get ,url is fetched like /jpurnal ,
    fetch(`${BASE}${url}`, {                  //as we have base , so fetch becomes , https://growth-within.onrender.com/journal
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(res => res.json()),

  post: (url, body) =>
    fetch(`${BASE}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    }).then(res => res.json()),

  put: (url, body) =>
    fetch(`${BASE}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    }).then(res => res.json()),

  delete: (url) =>
    fetch(`${BASE}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(res => res.json()),
};