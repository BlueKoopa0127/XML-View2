// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req, res) {
  const { id, ranges } = req.query;
  const apiKey = process.env.API_KEY;

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchGet?ranges=${ranges
      .map(encodeURIComponent)
      .join('&ranges=')}&majorDimension=COLUMNS&key=${apiKey}`,
  );
  const data = await response.json();

  res.status(200).json(data);
}
