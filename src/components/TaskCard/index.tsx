import React from 'react';
import { View, Text, Picker, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { MorningTask, BusInfo, RouteInfo, TodayTaskStatus } from '@/types';
import { formatDate, getTodayTaskStatusText } from '@/utils';

interface TaskCardProps {
  task: MorningTask;
  busList: BusInfo[];
  routeList: RouteInfo[];
  selectedBusId: string;
  selectedRouteId: string;
  onBusChange: (busId: string) => void;
  onRouteChange: (routeId: string) => void;
  onStartTest: () => void;
  todayStatus?: TodayTaskStatus;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  busList,
  routeList,
  selectedBusId,
  selectedRouteId,
  onBusChange,
  onRouteChange,
  onStartTest,
  todayStatus = 'pending'
}) => {
  const selectedBus = busList.find((b) => b.id === selectedBusId);
  const selectedRoute = routeList.find((r) => r.id === selectedRouteId);
  const canStart = !!selectedBusId && !!selectedRouteId;
  const isFinished = todayStatus !== 'pending';

  const handleBusPickerChange = (e: any) => {
    const idx = parseInt(e.detail.value);
    if (busList[idx]) onBusChange(busList[idx].id);
  };

  const handleRoutePickerChange = (e: any) => {
    const idx = parseInt(e.detail.value);
    if (routeList[idx]) onRouteChange(routeList[idx].id);
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.taskLabel}>今日晨检任务</Text>
          <Text className={styles.taskTitle}>{task.driverName} · 晨检酒测</Text>
          <Text className={styles.taskDate}>{formatDate(task.date)} · {task.schoolName || '阳光双语实验学校'}</Text>
        </View>
        <View className={classnames(styles.statusBadge, styles[todayStatus])}>
          {getTodayTaskStatusText(todayStatus)}
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>驾驶员</Text>
          <Text className={styles.infoValue}>{task.driverName}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>随车照管员</Text>
          <Text className={styles.infoValue}>{task.assistantName}</Text>
        </View>
      </View>

      <View className={styles.selectSection}>
        <Picker
          mode='selector'
          range={busList.map((b) => b.plateNo)}
          onChange={handleBusPickerChange}
        >
          <View className={styles.selectRow}>
            <Text className={styles.selectLabel}>选择车牌</Text>
            <View className={styles.selectPicker}>
              <Text className={selectedBus ? styles.pickerValue : styles.pickerPlaceholder}>
                {selectedBus ? selectedBus.plateNo : '请选择今日车辆'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </View>
        </Picker>

        <Picker
          mode='selector'
          range={routeList.map((r) => r.name)}
          onChange={handleRoutePickerChange}
        >
          <View className={styles.selectRow}>
            <Text className={styles.selectLabel}>选择线路</Text>
            <View className={styles.selectPicker}>
              <Text className={selectedRoute ? styles.pickerValue : styles.pickerPlaceholder}>
                {selectedRoute ? selectedRoute.name : '请选择今日线路'}
              </Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </View>
        </Picker>
      </View>

      <View className={styles.timeHighlight}>
        <View className={styles.timeIcon}>⏰</View>
        <Text className={styles.timeText}>
          首站发车时间 <Text className={styles.timeValue}>{selectedRoute?.firstStopTime || task.firstStopTime}</Text> 前必须完成检测
        </Text>
      </View>

      {todayStatus === 'completed' && (
        <View className={styles.doneBanner}>
          <View className={styles.doneIcon}>✓</View>
          <Text className={styles.doneText}>今日晨检已完成，检测合格，可安全发车</Text>
        </View>
      )}

      {todayStatus === 'waiting' && (
        <View className={styles.waitingBanner}>
          <View className={styles.waitingIcon}>!</View>
          <Text className={styles.waitingText}>
            已提交异常上报，等待安全员处理，暂不可发车
          </Text>
        </View>
      )}

      {todayStatus === 'handled' && (
        <View className={styles.doneBanner}>
          <View className={styles.doneIcon}>✓</View>
          <Text className={styles.doneText}>异常已由安全员处理完毕，请按处理结论执行</Text>
        </View>
      )}

      <Button
        className={classnames(styles.actionBtn, !canStart && !isFinished && styles.disabled)}
        onClick={() => {
          if (!canStart) {
            Taro.showToast({ title: '请先选择车牌和线路', icon: 'none' });
            return;
          }
          onStartTest();
        }}
      >
        {todayStatus === 'completed' ? '重新检测' : todayStatus === 'waiting' ? '查看处理进度' : todayStatus === 'handled' ? '查看记录' : '开始晨检酒测'}
      </Button>
    </View>
  );
};

export default TaskCard;
