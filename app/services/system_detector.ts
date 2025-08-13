// app/Services/SystemDetector.js
import os from 'node:os'

export default class SystemDetector {
  public static isWindows = os.platform() === 'win32'
  public static isMacOS = os.platform() === 'darwin'
  public static isLinux = os.platform() === 'linux'

  public static isProduction = process.env.NODE_ENV === 'production'
  public static isDevelopment = process.env.NODE_ENV === 'development'
}
