import React from 'react';
import { Box, Typography, Card, Grid } from '@mui/material';
import Image from 'next/image';
import folder from '@/public/folder.gif';
import puzzle from '@/public/puzzle.gif';
import pencil from '@/public/pencil.gif';
import book from '@/public/book.gif';
import plane from '@/public/paper-plane.gif';
import shelves from '@/public/shelves.gif';
import Image from 'next/image';

//add 3 more feature boxes with filler text

const cardStyle = {
    width: '100%',
    padding:"10px",
    margin:"15px",
    borderRadius:"12px",
    transition: "transform 0.3s ease",
};

const cardsx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    "&:hover":{
        transform: "scale(1.05)",
    }
}

const cardTextsx = {
    padding: '10px'
}

export default function Features() {
    return (
        <div
            style={{
                backgroundColor: "#e7e6e3",
                padding: "50px",
                paddingBottom: "100px",
            }}
        >
            <h1
                className="text-4xl font-extrabold text-black sm:text-center sm:text-6xl"
                style={{ marginBottom: "40px" }}
            >
                Features
            </h1>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    margin: "0 4vw",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <Card style={cardStyle} sx={{ ...cardsx }}>
                        <Image
                            src={pencil}
                            alt="Pencil Gif"
                            style={{ width: "100px", height: "auto" }}
                        />
                        <Typography textAlign="center" fontWeight="bold" variant="h6">
                            Interactive Flashcard Generator
                        </Typography>
                        <Typography sx={{ ...cardTextsx }}>
                            Create personalized flashcards instantly by providing a prompt or
                            topic. Our advanced AI technology ensures that your flashcards are
                            accurate and tailored to your needs.
                        </Typography>
                    </Card>
                    <Card style={cardStyle} sx={{ ...cardsx }}>
                        <Image
                            src={folder}
                            alt="Folder Gif"
                            style={{ width: "100px", height: "auto" }}
                        />
                        <Typography textAlign="center" fontWeight="bold" variant="h6">
                            Customizable Decks
                        </Typography>
                        <Typography sx={{ ...cardTextsx }}>
                            Organize your flashcards into decks for easier study and review.
                            Customize your decks with unique names and descriptions to keep
                            your learning materials well-organized.
                        </Typography>
                    </Card>
                    <Card style={cardStyle} sx={{ ...cardsx }}>
                        <Image
                            src={puzzle}
                            alt="Puzzle Gif"
                            style={{ width: "100px", height: "auto" }}
                        />
                        <Typography textAlign="center" fontWeight="bold" variant="h6">
                            Personalized Learning Experience
                        </Typography>
                        <Typography sx={{ ...cardTextsx }}>
                            Enhance your studying with our intelligent quiz features and
                            AI-powered suggestions.
                        </Typography>
                    </Card>
                </div>
                <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <Card style={cardStyle} sx={{ ...cardsx }}>
                        <Image
                            src={book}
                            alt="Book Gif"
                            style={{ width: "100px", height: "auto" }}
                        />
                        <Typography textAlign="center" fontWeight="bold" variant="h6">
                            Challenge
                        </Typography>
                        <Typography sx={{ ...cardTextsx }}>
                            Whether your cramming for a test or utilizing active recall, FlashCardify has you covered with our Challenge feature.
                        </Typography>
                    </Card>
                    <Card style={cardStyle} sx={{ ...cardsx }}>
                        <Image
                            src={shelves}
                            alt="Shelves Gif"
                            style={{ width: "100px", height: "auto" }}
                        />
                        <Typography textAlign="center" fontWeight="bold" variant="h6">
                            Public Flashcard Library
                        </Typography>
                        <Typography sx={{ ...cardTextsx }}>
                            Post your flashcards to the public library to share with others or use flashcards created by other users.
                        </Typography>
                    </Card>
                    <Card style={cardStyle} sx={{ ...cardsx }}>
                        <Image
                            src={plane}
                            alt="Paper Plane Gif"
                            style={{ width: "100px", height: "auto" }}
                        />
                        <Typography textAlign="center" fontWeight="bold" variant="h6">
                            Minimalistic Design
                        </Typography>
                        <Typography sx={{ ...cardTextsx }}>
                        Enjoy a clean, clutter-free interface designed for a focused and seamless study experience.
                        </Typography>
                    </Card>
                </div>
            </div>
        </div>
    );
}