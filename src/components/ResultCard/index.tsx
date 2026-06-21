import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { TestResult } from '@/types';

interface ResultCardProps {
  result: TestResult;
  alcoholValue: number;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryText?: string;
  secondaryText?: string;
}

const getResultText = (result: TestResult) => {
  switch (result) {
    case 'pass': return { title: '可发车', subtitle: '检测合格，请安全出车', icon: '✓', primary: '完成' };
    case 'retest': return { title: '需复测', subtitle: '接近临界值，请进行复测', icon: '!', primary: '立即复测', secondary: '上报异常' };
    case 'fail': return { title: '禁止发车', subtitle: '检测超标，严禁驾驶', icon: '✕', primary: '上报异常' };
  }
};

const getTipList = (result: TestResult): { text: string; type?: 'warn' | 'danger' }[] => {
  switch (result) {
    case 'pass':
      return [
        { text: '按照线路准点发车，确保学生安全' },
        { text: '行驶途中保持注意力，严禁疲劳驾驶' },
        { text: '收车后做好车辆检查记录' }
      ];
    case 'retest':
      return [
        { text: '请等待5分钟后进行复测', type: 'warn' },
        { text: '复测期间请勿进食、饮水、吸烟', type: 'warn' },
        { text: '如复测仍不达标，请立即上报安全员' }
      ];
    case 'fail':
      return [
        { text: '严禁驾驶任何车辆，立即停止作业', type: 'danger' },
        { text: '请联系安全员安排替班司机', type: 'danger' },
        { text: '如实说明情况，配合调查处理' }
      ];
  }
};

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  alcoholValue,
  onPrimaryAction,
  onSecondaryAction,
  primaryText,
  secondaryText
}) => {
  const resultConfig = getResultText(result);
  const tipList = getTipList(result);

  return (
    <View className={classnames(styles.card, styles[result])}>
      <View className={classnames(styles.iconWrapper, styles[result])}>
        <Text>{resultConfig.icon}</Text>
      </View>

      <Text className={classnames(styles.resultTitle, styles[result])}>{resultConfig.title}</Text>
      <Text className={styles.resultSubtitle}>{resultConfig.subtitle}</Text>

      <View className={styles.alcoholBox}>
        <Text className={styles.alcoholLabel}>酒精检测读数</Text>
        <View className={styles.alcoholValue}>
          {alcoholValue}
          <Text className={styles.unit}>mg/100ml</Text>
        </View>
        <Text className={styles.alcoholTip}>
          标准：0-19 合格 | 20-79 需复测 | ≥80 禁止
        </Text>
      </View>

      <View className={styles.tipList}>
        {tipList.map((tip, idx) => (
          <Text key={idx} className={classnames(styles.tipItem, tip.type && styles[tip.type])}>
            {tip.text}
          </Text>
        ))}
      </View>

      <View className={styles.actionBtns}>
        {result !== 'pass' && onSecondaryAction && (
          <Button
            className={classnames(styles.btnSecondary, styles[result])}
            onClick={onSecondaryAction}
          >
            {secondaryText || resultConfig.secondary}
          </Button>
        )}
        <Button
          className={classnames(styles.btnPrimary, styles[result])}
          onClick={onPrimaryAction}
        >
          {primaryText || resultConfig.primary}
        </Button>
      </View>
    </View>
  );
};

export default ResultCard;
