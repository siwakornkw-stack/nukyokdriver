export interface HeaderAgent {
  xApiCat: string
  xApiKey: string
}

export interface ReqRegister {
  username: string
  password: string
}
export interface ResRegister {
  username: string;
}
export interface ReqBalance {
  username: string
}

export interface ReqChangePassword {
  username: string
  new_password: string
}export interface ReqTransfer {
  username: string
  amount: string
  ref: string
}export interface ReqCreditHistory {
  username: string
  start: string
  end: string
}export interface ReqGameSetting {
  username: string
  games: []
}export interface ReqCommission {
  username: string
}export interface ReqDirectPlay {
  username: string
  provider: string
  gamecode: string
  language: string
  openGame: boolean
  returnUrl: string
}export interface ReqAgentBalance {
  upline: string
}export interface ReqListsGameProvider {
  gamecode: string
}