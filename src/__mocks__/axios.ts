import { AxiosStatic } from "axios"

const mockAxios: AxiosStatic = jest.genMockFromModule("axios")
const realAxios: AxiosStatic = jest.requireActual("axios")

// https://stackoverflow.com/questions/51393952/mock-inner-axios-create
mockAxios.create = jest.fn(() => mockAxios)

mockAxios.CancelToken = realAxios.CancelToken

export default mockAxios
