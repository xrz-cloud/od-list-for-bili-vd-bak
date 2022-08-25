import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch'
import { getAccessToken } from './_getAccessToken'
import { wrapPath } from './_pathHandler'

const {
  top = 500,
  drive_api = 'https://graph.microsoft.com/v1.0/me/drive',
} = process.env

export default async (req: VercelRequest, res: VercelResponse) => {
  const { path = '' } = req.query
  const _path: string = path as string

  const access_token = await getAccessToken()
  if (!access_token) {
    console.error('access_token is empty.')
    return
  }

  const data = await getItem(_path, access_token)

  delete data['@odata.context']
  delete data['@odata.nextLink']
  if ('value' in data) {
    for (const i of data.value) {
      delete i['@odata.etag']
      if ('file' in i) delete i['file']['hashes']
    }
  } else {
    delete data['@odata.etag']
    if ('file' in data) delete data['file']['hashes']
  }

  // res.setHeader('Cache-Control', `public, max-age=120, immutable, s-maxage=${300 - 120}, stale-while-revalidate=${3600 * 3}`)
  res.setHeader('Cache-Control', `public, max-age=60, immutable, s-maxage=${180 - 60}`)
  res.json(data)
}

async function getItem(path: string, access_token: any) {
  const requestUrl = `${drive_api}${wrapPath(path, '/children')}?select=name,size,lastModifiedDateTime,file&$top=${top}`
  console.log(requestUrl)
  const res = await fetch(requestUrl, {
    headers: {
      Authorization: `bearer ${access_token}`
    }
  })
  return await res.json()
}