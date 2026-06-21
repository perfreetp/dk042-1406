import type { TestRecord, SafetyNotice } from '@/types';

const genDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const genDateTime = (daysAgo: number, hour: number, min: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

export const mockRecords: TestRecord[] = [
  {
    id: 'REC001',
    date: genDate(1),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'pass',
    result: 'pass',
    alcoholValue: 0,
    checkInPhoto: 'https://picsum.photos/id/177/400/300',
    testPhoto: 'https://picsum.photos/id/91/400/300',
    testTime: genDateTime(1, 6, 10),
    assistantName: '李美华'
  },
  {
    id: 'REC002',
    date: genDate(2),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'pass',
    result: 'pass',
    alcoholValue: 0,
    checkInPhoto: 'https://picsum.photos/id/338/400/300',
    testPhoto: 'https://picsum.photos/id/1027/400/300',
    testTime: genDateTime(2, 6, 8),
    assistantName: '李美华'
  },
  {
    id: 'REC003',
    date: genDate(3),
    driverName: '张建国',
    plateNo: '沪A67890',
    routeName: '2号线-西线',
    firstStopTime: '06:45',
    status: 'retest',
    result: 'retest',
    alcoholValue: 35,
    checkInPhoto: 'https://picsum.photos/id/177/400/300',
    testPhoto: 'https://picsum.photos/id/64/400/300',
    testTime: genDateTime(3, 6, 20),
    assistantName: '王小燕',
    exceptionType: 'over_limit',
    exceptionRemark: '昨晚参加朋友聚会，早晨吹气仍有读数，已通知安全员，复测后合格',
    exceptionPhotos: ['https://picsum.photos/id/91/400/300']
  },
  {
    id: 'REC004',
    date: genDate(4),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'pass',
    result: 'pass',
    alcoholValue: 0,
    checkInPhoto: 'https://picsum.photos/id/338/400/300',
    testPhoto: 'https://picsum.photos/id/177/400/300',
    testTime: genDateTime(4, 6, 12),
    assistantName: '李美华'
  },
  {
    id: 'REC005',
    date: genDate(5),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'exception',
    alcoholValue: undefined,
    checkInPhoto: 'https://picsum.photos/id/64/400/300',
    testPhoto: 'https://picsum.photos/id/1027/400/300',
    testTime: genDateTime(5, 6, 35),
    assistantName: '李美华',
    exceptionType: 'device_error',
    exceptionRemark: '酒测仪无法开机，电池没电，已报修，安全员确认后换备用设备完成检测',
    exceptionPhotos: ['https://picsum.photos/id/91/400/300', 'https://picsum.photos/id/177/400/300']
  },
  {
    id: 'REC006',
    date: genDate(6),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'pass',
    result: 'pass',
    alcoholValue: 0,
    checkInPhoto: 'https://picsum.photos/id/338/400/300',
    testPhoto: 'https://picsum.photos/id/64/400/300',
    testTime: genDateTime(6, 6, 5),
    assistantName: '李美华'
  },
  {
    id: 'REC007',
    date: genDate(7),
    driverName: '张建国',
    plateNo: '沪A54321',
    routeName: '3号线-南线',
    firstStopTime: '06:40',
    status: 'pass',
    result: 'pass',
    alcoholValue: 5,
    checkInPhoto: 'https://picsum.photos/id/177/400/300',
    testPhoto: 'https://picsum.photos/id/91/400/300',
    testTime: genDateTime(7, 6, 15),
    assistantName: '赵秀兰'
  },
  {
    id: 'REC008',
    date: genDate(8),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'fail',
    result: 'fail',
    alcoholValue: 125,
    checkInPhoto: 'https://picsum.photos/id/64/400/300',
    testPhoto: 'https://picsum.photos/id/338/400/300',
    testTime: genDateTime(8, 6, 25),
    assistantName: '李美华',
    exceptionType: 'over_limit',
    exceptionRemark: '严重超标，已移交安全员处理，停止当日驾驶任务，安排替班司机',
    exceptionPhotos: ['https://picsum.photos/id/1027/400/300']
  },
  {
    id: 'REC009',
    date: genDate(9),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'pass',
    result: 'pass',
    alcoholValue: 0,
    checkInPhoto: 'https://picsum.photos/id/177/400/300',
    testPhoto: 'https://picsum.photos/id/64/400/300',
    testTime: genDateTime(9, 6, 8),
    assistantName: '李美华'
  },
  {
    id: 'REC010',
    date: genDate(10),
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    firstStopTime: '06:30',
    status: 'pass',
    result: 'pass',
    alcoholValue: 2,
    checkInPhoto: 'https://picsum.photos/id/338/400/300',
    testPhoto: 'https://picsum.photos/id/91/400/300',
    testTime: genDateTime(10, 6, 10),
    assistantName: '李美华'
  }
];

export const mockSafetyNotices: SafetyNotice[] = [
  {
    id: 'N001',
    taskId: 'REC003',
    driverName: '张建国',
    plateNo: '沪A67890',
    routeName: '2号线-西线',
    exceptionType: 'over_limit',
    exceptionRemark: '昨晚参加朋友聚会，早晨吹气仍有读数，已通知安全员，复测后合格',
    alcoholValue: 35,
    photos: ['https://picsum.photos/id/91/400/300'],
    createTime: genDateTime(3, 6, 22),
    handled: true,
    handleTime: genDateTime(3, 6, 35),
    handlerName: '安全员-刘主管',
    handleRemark: '已现场监督复测，复测值为8mg/100ml，合格放行，已对司机进行安全教育'
  },
  {
    id: 'N002',
    taskId: 'REC005',
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    exceptionType: 'device_error',
    exceptionRemark: '酒测仪无法开机，电池没电，已报修，安全员确认后换备用设备完成检测',
    photos: ['https://picsum.photos/id/91/400/300', 'https://picsum.photos/id/177/400/300'],
    createTime: genDateTime(5, 6, 38),
    handled: true,
    handleTime: genDateTime(5, 6, 50),
    handlerName: '安全员-刘主管',
    handleRemark: '已使用备用酒测仪完成检测，结果合格。设备已安排送修'
  },
  {
    id: 'N003',
    taskId: 'REC008',
    driverName: '张建国',
    plateNo: '沪A12345',
    routeName: '1号线-东线',
    exceptionType: 'over_limit',
    exceptionRemark: '严重超标，已移交安全员处理，停止当日驾驶任务，安排替班司机',
    alcoholValue: 125,
    photos: ['https://picsum.photos/id/1027/400/300'],
    createTime: genDateTime(8, 6, 28),
    handled: true,
    handleTime: genDateTime(8, 6, 45),
    handlerName: '安全员-刘主管',
    handleRemark: '已安排替班司机王师傅顶替1号线，张师傅已进行约谈，按公司规定处理'
  }
];
