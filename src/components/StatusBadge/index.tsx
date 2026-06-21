import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { TestStatus } from '@/types';
import { getStatusText } from '@/utils';

interface StatusBadgeProps {
  status: TestStatus;
  customText?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customText, className }) => {
  return (
    <View className={classnames(styles.badge, styles[status], className)}>
      <Text>{customText || getStatusText(status)}</Text>
    </View>
  );
};

export default StatusBadge;
