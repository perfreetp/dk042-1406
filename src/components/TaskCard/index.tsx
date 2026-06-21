import React from 'react';
import { View, Text, Picker, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { MorningTask, BusInfo, RouteInfo } from '@/types';
import { formatDate } from '@/utils';

interface TaskCardProps {
  task: MorningTask;
  busList: BusInfo[];
  routeList: RouteInfo[];
  selectedBusId: string;
  selectedRouteId: string;
  onBusChange: (busId: string) => void;
  onRouteChange: (routeId: string) => void;
  onStartTest: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  busList,
  routeList,
  selectedBusId,
  selectedRouteId,
  onBusChange,
  onRouteChange,
  onStartTest
}) => {
  const selectedBus = busList.find((b) => b.id === selectedBusId);
  const selectedRoute = routeList.find((r) => r.id === selectedRouteId);
  const canStart = !!selectedBusId && !!selectedRouteId;

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

      <Button
        className={classnames(styles.actionBtn, !canStart && styles.disabled)}
        onClick={() => {
          if (!canStart) {
            Taro.showToast({ title: '请先选择车牌和线路', icon: 'none' });
            return;
          }
          onStartTest();
        }}
      >
        开始晨检酒测
      </Button>
    </View>
  );
};

export default TaskCard;
