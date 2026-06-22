import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}

export function AnimatedList({ children, className }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className }: Props) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
