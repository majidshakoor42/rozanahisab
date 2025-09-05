import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const SplashScreen = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<motion.div
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.8, ease: 'easeOut' }}
				className="flex flex-col items-center gap-4"
			>
				<div className="p-4 rounded-xl bg-gradient-to-r from-teal-500 to-green-600 shadow-lg shadow-green-500/30">
					<BookOpen className="w-12 h-12 text-white" />
				</div>
				<h1 className="text-3xl font-bold gradient-text">Rozana Hisab</h1>
				<p className="text-muted-foreground">Loading your business...</p>
			</motion.div>
		</div>
	);
};


export default SplashScreen;
