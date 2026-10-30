const BASE_URL = "http://localhost:3000";

async function request(path, method = "GET", body) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}/${path}`, options);
  if (!res.ok) {
    throw new Error("Request failed: " + res.status);
  }
  return res.json();
}
export async function expireOldBookings() {
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const confirmed = await getData("bookings?status=Confirmed");
  const expired = confirmed.filter((b) => b.checkOut < today);

  for (const b of expired) {
    await patchData(`bookings/${b.id}`, { status: "Completed" });
    await patchData(`rooms/${b.roomId}`, { available: true });
  }
}

export const getData = (path) => request(path);
export const postData = (path, body) => request(path, "POST", body);
export const putData = (path, body) => request(path, "PUT", body);
export const patchData = (path, body) => request(path, "PATCH", body);
export const deleteData = (path) => request(path, "DELETE");
