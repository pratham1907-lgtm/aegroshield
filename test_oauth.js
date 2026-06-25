const token = "AQ.Ab8RN6L4c-JIqLFrQbuHJoxqLTGJ9S_CZQAMaEsVcX0Esw6DdA";

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: "Respond with 'hello world'" }]
      }]
    })
  });
  
  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
