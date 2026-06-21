export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/records/index',
    'pages/mine/index',
    'pages/alcohol-test/index',
    'pages/exception-report/index',
    'pages/record-detail/index',
    'pages/safety-notice/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2563EB',
    navigationBarTitleText: '校车晨检酒测',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0F4F8'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '任务'
      },
      {
        pagePath: 'pages/records/index',
        text: '记录'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
