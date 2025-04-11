
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, Video } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-20 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div className="mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  Next Generation Virtual Classroom
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl"
              >
                <span className="block">Transform teaching</span>
                <span className="block text-primary mt-1">and learning online</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-base text-gray-500 dark:text-gray-400 sm:text-xl lg:text-lg xl:text-xl"
              >
                ClassroomHive offers a premium virtual learning environment with enhanced features for collaborative education, assignments management, and real-time interaction.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-8 sm:flex sm:justify-center lg:justify-start"
              >
                <div className="rounded-md shadow">
                  <Button size="lg" asChild>
                    <Link to="/signup">
                      Get Started
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/login">
                      Log In
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-16 sm:mt-24 lg:col-span-6 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 sm:mx-auto sm:w-full sm:max-w-md sm:overflow-hidden sm:rounded-2xl shadow-xl"
            >
              <div className="relative aspect-[4/3] w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-t-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80" 
                    alt="Virtual classroom illustration" 
                    className="h-full w-full object-cover opacity-30 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <BookOpen className="h-10 w-10 mb-2" />
                    <h3 className="text-xl font-bold">Introduction to Biology</h3>
                    <p className="text-sm mt-2 text-center">Join the class with code: BIO101</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-6 sm:px-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">32 Students</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Actively participating</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">12 Assignments</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due this month</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Live Class</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow at 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="h-64 w-64 rounded-full bg-primary"
          style={{ filter: 'blur(50px)' }}
        ></motion.div>
      </div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 hidden lg:block">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="h-64 w-64 rounded-full bg-blue-400"
          style={{ filter: 'blur(50px)' }}
        ></motion.div>
      </div>
    </div>
  );
};

export default Hero;
