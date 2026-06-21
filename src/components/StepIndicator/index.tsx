import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { StepConfig, TestStep } from '@/types';

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: TestStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  const getStepStatus = (stepNum: TestStep): 'done' | 'active' | 'pending' => {
    if (stepNum < currentStep) return 'done';
    if (stepNum === currentStep) return 'active';
    return 'pending';
  };

  const doneCount = steps.filter((_, i) => (i + 1) < currentStep).length;
  const fillPercent = (doneCount / (steps.length - 1)) * 100;

  return (
    <View className={styles.container}>
      <View className={styles.connector}>
        <View className={styles.connectorFill} style={{ width: `${fillPercent}%` }} />
      </View>
      {steps.map((step) => {
        const status = getStepStatus(step.step);
        return (
          <View key={step.step} className={styles.stepWrapper}>
            <View
              className={classnames(styles.stepCircle, {
                [styles.done]: status === 'done',
                [styles.active]: status === 'active',
                [styles.pending]: status === 'pending'
              })}
            >
              <Text>{status === 'done' ? '✓' : step.step}</Text>
            </View>
            <Text
              className={classnames(styles.stepTitle, {
                [styles.done]: status === 'done',
                [styles.active]: status === 'active',
                [styles.pending]: status === 'pending'
              })}
            >
              {step.title}
            </Text>
            <Text className={styles.stepDesc}>{step.desc}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default StepIndicator;
