import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition } from "@/utils/animations";

interface AnimatedTransitionProps {
  children: ReactNode;
  className?: string;
}

const AnimatedTransition = ({
  children,
  className = "",
}: AnimatedTransitionProps) => {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTransition;
