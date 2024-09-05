import React from 'react';
import { Box, Typography, Card, Grid } from '@mui/material';
import Image from 'next/image';
import folder from '@/public/folder.gif';
import puzzle from '@/public/puzzle.gif';
import pencil from '@/public/pencil.gif';
import book from '@/public/book.gif';
import plane from '@/public/paper-plane.gif';
import shelves from '@/public/shelves.gif';

const cardStyle = {
    width: '100%',
    padding: "20px",
    margin: "10px",
    borderRadius: "12px",
    transition: "transform 0.3s ease",
};

const cardsx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    height: '100%',
    "&:hover": {
        transform: "scale(1.05)",
    }
};

const cardTextsx = {
    padding: '10px',
    flexGrow: 1,
};

const featureItems = [
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
    },
    {
        image: book,
        title: "Challenge",
        description: "Whether you're cramming for a test or utilizing active recall, FlashCardify has you covered with our Challenge feature."
    },
    {
        image: shelves,
        title: "Public Flashcard Library",
        description: "Post your flashcards to the public library to share with others or use flashcards created by other users."
    },
    {
        image: plane,
        title: "Minimalistic Design",
        description: "Enjoy a clean, clutter-free interface designed for a focused and seamless study experience."
    }
];

export default function Features() {
    return (
        <Box
            sx={{
                backgroundColor: "#e7e6e3",
                padding: { xs: "20px", sm: "30px", md: "50px" },
                paddingBottom: { xs: "50px", sm: "75px", md: "100px" },
            }}
        >
            <Typography
                variant="h2"
                component="h1"
                sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                    textAlign: "center",
                    marginBottom: { xs: "20px", sm: "30px", md: "40px" },
                    color: "black",
                }}
            >
                Features
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    margin: "0 auto",
                    maxWidth: "1200px",
                }}
            >
                <Grid container spacing={3} justifyContent="center">
                    {featureItems.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card style={cardStyle} sx={cardsx}>
                                <Image
                                    src={item.image}
                                    alt={`${item.title} Gif`}
                                    style={{ width: "100px", height: "auto" }}
                                />
                                <Typography
                                    textAlign="center"
                                    fontWeight="bold"
                                    variant="h6"
                                    sx={{ my: 2 }}
                                >
                                    {item.title}
                                </Typography>
                                <Typography sx={cardTextsx}>
                                    {item.description}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}