import type { MorningTask, BusInfo, RouteInfo } from '@/types';

export const mockBusList: BusInfo[] = [
  { id: 'B001', plateNo: '沪A12345', routeId: 'R001', routeName: '1号线-东线', seatCount: 45 },
  { id: 'B002', plateNo: '沪A67890', routeId: 'R002', routeName: '2号线-西线', seatCount: 45 },
  { id: 'B003', plateNo: '沪A54321', routeId: 'R003', routeName: '3号线-南线', seatCount: 39 }
];

export const mockRouteList: RouteInfo[] = [
  {
    id: 'R001',
    name: '1号线-东线',
    firstStopTime: '06:30',
    stops: ['东方花园站', '阳光小区站', '翠湖花园站', '学校正门'],
    assistantName: '李美华',
    assistantPhone: '139****1234'
  },
  {
    id: 'R002',
    name: '2号线-西线',
    firstStopTime: '06:45',
    stops: ['西湖花园站', '和平小区站', '学府路站', '学校正门'],
    assistantName: '王小燕',
    assistantPhone: '139****5678'
  },
  {
    id: 'R003',
    name: '3号线-南线',
    firstStopTime: '06:40',
    stops: ['南湖花园站', '锦绣小区站', '人民路站', '学校正门'],
    assistantName: '赵秀兰',
    assistantPhone: '139****9012'
  }
];

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

export const mockTodayTask: MorningTask = {
  id: 'T' + Date.now(),
  date: todayStr,
  driverId: 'U001',
  driverName: '张建国',
  assistantName: '李美华',
  assistantPhone: '139****1234',
  busId: '',
  plateNo: '',
  routeId: '',
  routeName: '',
  firstStopTime: '06:30',
  status: 'pending'
};

export const mockTasks: MorningTask[] = [mockTodayTask];
