import React from 'react';
import { Box, Typography, Card, Grid } from '@mui/material';
import Image from 'next/image';
import folder from '@/public/folder.gif';
import puzzle from '@/public/puzzle.gif';
import pencil from '@/public/pencil.gif';

const cardStyle = {
  height: '100%',
  padding: "20px",
  borderRadius: "12px",
  transition: "transform 0.3s ease",
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  "&:hover": {
    transform: "scale(1.05)",
  }
};

const Features = () => {
  const featureData = [
    {
      image: pencil,
      title: "Interactive Flashcard Generator",
      description: "Create personalized flashcards instantly by providing a prompt or topic. Our advanced AI technology ensures that your flashcards are accurate and tailored to your needs."
    },
    {
      image: folder,
      title: "Customizable Decks",
      description: "Organize your flashcards into decks for easier study and review. Customize your decks with unique names and descriptions to keep your learning materials well-organized."
    },
    {
      image: puzzle,
      title: "Personalized Learning Experience",
      description: "Enhance your studying with our intelligent quiz features and AI-powered suggestions."
    }
  ];

  return (
    <Box sx={{
      backgroundColor: "#e7e6e3",
      padding: { xs: "30px", sm: "50px" },
      paddingBottom: { xs: "50px", sm: "100px" }
    }}>
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "40px",
          fontSize: { xs: '2.5rem', sm: '3.75rem' }
        }}
      >
        Features
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {featureData.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={cardStyle}>
              <Image 
                src={feature.image} 
                alt={`${feature.title} Gif`} 
                style={{ width: '100px', height: 'auto', marginBottom: '15px' }} 
              />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {feature.title}
              </Typography>
              <Typography>
                {feature.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Features;