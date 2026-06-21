export type TestStatus = 'pending' | 'testing' | 'pass' | 'retest' | 'fail' | 'exception';
export type TestResult = 'pass' | 'retest' | 'fail';
export type ExceptionType = 'over_limit' | 'device_error' | 'timeout' | 'other';
export type TestStep = 1 | 2 | 3;

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  employeeNo: string;
  schoolName: string;
  driverLicense: string;
}

export interface BusInfo {
  id: string;
  plateNo: string;
  routeId: string;
  routeName: string;
  seatCount: number;
}

export interface RouteInfo {
  id: string;
  name: string;
  firstStopTime: string;
  stops: string[];
  assistantName: string;
  assistantPhone: string;
}

export interface MorningTask {
  id: string;
  date: string;
  driverId: string;
  driverName: string;
  assistantName: string;
  assistantPhone: string;
  busId: string;
  plateNo: string;
  routeId: string;
  routeName: string;
  firstStopTime: string;
  status: TestStatus;
  alcoholValue?: number;
  checkInPhoto?: string;
  testPhoto?: string;
  testTime?: string;
  remark?: string;
  exceptionType?: ExceptionType;
  exceptionRemark?: string;
  exceptionPhotos?: string[];
  safetyHandled?: boolean;
  safetyRemark?: string;
}

export interface TestRecord {
  id: string;
  date: string;
  driverName: string;
  plateNo: string;
  routeName: string;
  firstStopTime: string;
  status: TestStatus;
  result?: TestResult;
  alcoholValue?: number;
  checkInPhoto: string;
  testPhoto: string;
  testTime: string;
  assistantName: string;
  exceptionType?: ExceptionType;
  exceptionRemark?: string;
  exceptionPhotos?: string[];
}

export interface SafetyNotice {
  id: string;
  taskId: string;
  driverName: string;
  plateNo: string;
  routeName: string;
  exceptionType: ExceptionType;
  exceptionRemark: string;
  alcoholValue?: number;
  photos: string[];
  createTime: string;
  handled: boolean;
  handleTime?: string;
  handlerName?: string;
  handleRemark?: string;
}

export interface StepConfig {
  step: TestStep;
  title: string;
  desc: string;
  status: 'done' | 'active' | 'pending';
}
