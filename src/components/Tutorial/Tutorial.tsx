import { useState } from 'react';
import styles from './Tutorial.module.css';

export function Tutorial() {
  const [show, setShow] = useState(() => {
    return localStorage.getItem('evem_tutorial_shown') !== '1';
  });

  const handleToggle = () => {
    const next = !show;
    setShow(next);
    if (!next) localStorage.setItem('evem_tutorial_shown', '1');
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggle} onClick={handleToggle}>
        {show ? '▼ 隐藏帮助' : '▶ 使用帮助'}
      </button>
      {show && (
        <div className={styles.content}>
          <p>本工具帮助你在《星战前夜：无烬星河》中计算工业项目的投入产出比。</p>
          <p><strong>使用步骤：</strong></p>
          <ol>
            <li>展开「技能和设施」面板，设置角色技能等级（或勾选效率配置使用快捷覆盖）</li>
            <li>在产品树中展开分类，选择制造或逆向工程项目</li>
            <li>选择解码器，查看材料效率和时间效率的预览效果</li>
            <li>在材料清单中填入各种材料的单价和折扣</li>
            <li>调整流程数，查看单流程耗时、最大总耗时</li>
            <li>点击「发送到出售」，在右侧输入售价查看利润</li>
          </ol>
          <p><strong>计算公式说明：</strong></p>
          <ul>
            <li>材料效率 = 150% − 技能加成 − 设施加成 + 解码器加成</li>
            <li>时间消耗 = 基础时间 × (1+技能) × (1+设施) × (1+解码器)</li>
            <li>成功率 = 基础成功率 × (1+技能+设施+解码器)，上限 100%</li>
            <li>现金费用 = 基础费用 × (1+技能) × 流程数</li>
            <li>折扣优先级：手动覆写 &gt; 材料清单 &gt; 全局规则</li>
          </ul>
          <a href="https://github.com/wangchai233/EVEM_Industry_Caculator">详见项目README文档（将跳转GitHub）</a>
        </div>
      )}
    </div>
  );
}
