
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, Video, MessageCircle, Calendar, Award, ShieldCheck } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      title: 'Classroom Management',
      description: 'Create, edit, and organize virtual classrooms. Students join with unique invite codes.',
      delay: 0
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: 'Assignments & Submissions',
      description: 'Create, schedule, and grade assignments. Students can submit work in various formats.',
      delay: 0.1
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
      title: 'Announcements & Discussions',
      description: 'Post updates and foster discussion with interactive comment sections.',
      delay: 0.2
    },
    {
      icon: <Video className="h-8 w-8 text-blue-500" />,
      title: 'Live Video Classes',
      description: 'Schedule and host engaging live classes with integrated chat and hand-raising.',
      delay: 0.3
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      title: 'Schedule & Reminders',
      description: 'Organize class schedules and send automatic reminders for assignments and events.',
      delay: 0.4
    },
    {
      icon: <Award className="h-8 w-8 text-blue-500" />,
      title: 'Grading & Feedback',
      description: 'Provide detailed feedback and performance tracking for students.',
      delay: 0.5
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: 'Collaboration Tools',
      description: 'Enable group projects, shared whiteboards, and collaborative study sessions.',
      delay: 0.6
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
      title: 'Privacy & Security',
      description: 'Protect class data with enterprise-grade security and privacy controls.',
      delay: 0.7
    }
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold text-blue-600 uppercase tracking-wide"
          >
            Features
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl"
          >
            Everything you need to create engaging virtual classrooms
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto"
          >
            Our comprehensive suite of tools empowers educators and enhances learning experiences.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 glass-card overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-50"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
