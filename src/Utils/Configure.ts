import { config } from "dotenv"
import { resolve } from "path"

export default (directory: string) => {
    const {NODE_ENV} = process.env
    config({ path: resolve(directory, 'config', `config.${NODE_ENV}.env`) })
}
