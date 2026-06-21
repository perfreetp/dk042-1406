import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import type { TestRecord } from '@/types';
import { formatTime, getExceptionTypeText } from '@/utils';

interface RecordItemProps {
  record: TestRecord;
  onClick?: () => void;
}

const getAlcoholClass = (val?: number) => {
  if (val === undefined) return '';
  if (val >= 80) return 'danger';
  if (val >= 20) return 'warn';
  return '';
};

const RecordItem: React.FC<RecordItemProps> = ({ record, onClick }) => {
  return (
    <View className={styles.item} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.dateText}>{record.date}</Text>
          <Text className={styles.routeText}>
            {record.routeName} · {record.plateNo}
          </Text>
        </View>
        <StatusBadge status={record.status} />
      </View>

      <View className={styles.infoRow}>
        <View className={styles.infoCell}>
          <Text className={styles.label}>检测时间</Text>
          <Text className={styles.value}>{formatTime(record.testTime)}</Text>
        </View>
        <View className={styles.infoCell}>
          <Text className={styles.label}>照管员</Text>
          <Text className={styles.value}>{record.assistantName}</Text>
        </View>
        <View className={classnames(styles.infoCell, styles.alcoholCell)}>
          <Text className={styles.label}>酒精值</Text>
          <Text className={classnames(styles.value, getAlcoholClass(record.alcoholValue))}>
            {record.alcoholValue !== undefined ? `${record.alcoholValue}` : '--'}
            {record.alcoholValue !== undefined && <Text style={{ fontSize: '20rpx', fontWeight: 'normal' }}> mg</Text>}
          </Text>
        </View>
      </View>

      {record.exceptionType && (
        <View className={styles.hasException}>
          <Text className={styles.tag}>{getExceptionTypeText(record.exceptionType)}</Text>
          <Text className={styles.text}>{record.exceptionRemark}</Text>
        </View>
      )}
    </View>
  );
};

export default RecordItem;
