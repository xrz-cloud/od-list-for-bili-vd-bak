import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccessToken } from './_getAccessToken'
export default async function (req: VercelRequest, res: VercelResponse) {
  const ace = await getAccessToken()
  const { name = 'World' } = req.query;
  res.status(200).send(`Hello ${name}!
  ${process.env.drive_api}
  ${ace} `);
}
