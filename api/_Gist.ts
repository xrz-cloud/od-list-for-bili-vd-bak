import { Octokit } from 'octokit'
//import { Endpoints } from "@octokit/types";

//type readResponese = Endpoints["GET /gists/{gist_id}"]['response']

export default class {
  #octokit
  #gist_id: string
  #gist_filename: string

  constructor(gist_token: string, gist_id: string, gist_filename: string) {
    if (!gist_token || !gist_id || !gist_filename) {
      throw new Error('gist_token, gist_id, gist_filename are required.')
    }
    this.#octokit = new Octokit({ auth: gist_token })
    this.#gist_id = gist_id
    this.#gist_filename = gist_filename
  }

  async read() {
    console.log('Fetch data from gist:', this.#gist_filename)
    const response = await this.#octokit.request('GET /gists/{gist_id}', {
      gist_id: this.#gist_id
    })
    if (!response.data.files) return false
    const res = response.data.files[this.#gist_filename]?.content as string
    return JSON.parse(res)
  }

  async write(data: any) {
    const data_str = JSON.stringify(data, null, 2)
    console.log('Update gist:', this.#gist_filename)
    const response = await this.#octokit.request('PATCH /gists/{gist_id}', {
      gist_id: this.#gist_id,
      files: {
        [this.#gist_filename]: {
          content: data_str
        }
      }
    })
    // return JSON.parse(response.data.files[this.#gist_filename].content)
  }
}