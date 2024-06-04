export async function Flight({ flightNumber }) {
  // const data = await fetch(`https://api.example.com/flight/${flightNumber}`);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return (
    <div>
      <div>details for {flightNumber}</div>
      {/* <div>{data.status}</div> */}
      {/* <div>{data.source}</div> */}
      {/* <div>{data.destination}</div> */}
    </div>
  );
}
