import { Box, Button, Typography, Card } from '@mui/material';
import folder from '@/public/folder.gif';
import puzzle from '@/public/puzzle.gif';
import pencil from '@/public/pencil.gif';
import Image from 'next/image';

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
    return(
        <div style={{
            backgroundColor:"#e7e6e3",
            padding:"50px",
            paddingBottom:"100px"
        }}>
            <h1 className="text-4xl font-extrabold text-black sm:text-center sm:text-6xl" style={{marginBottom:"40px"}}>
              Features
            </h1>
            <div style={{
                display:"flex",
                flexDirection:'row',
                justifyContent:"space-evenly",
                margin:"0 4vw"
            }}>
                <Card style={cardStyle} sx={{...cardsx}}>
                    <Image 
                        src={pencil} 
                        alt="Pencil Gif" 
                        style={{ width: '100px', height: 'auto'}} 
                    />
                    <Typography textAlign="center" fontWeight="bold" variant="h6">Interactive Flashcard Generator</Typography>
                    <Typography sx={{...cardTextsx}}>
                        Create personalized flashcards instantly by providing a prompt or topic. 
                        Our advanced AI technology ensures that your flashcards are accurate and tailored to your needs.
                    </Typography>
                </Card>
                <Card style={cardStyle} sx={{...cardsx}}>
                    <Image 
                        src={folder} 
                        alt="Folder Gif" 
                        style={{ width: '100px', height: 'auto'}} 
                    />
                    <Typography textAlign="center" fontWeight="bold" variant="h6"> Customizable Decks</Typography>
                    <Typography sx={{...cardTextsx}}>
                        Organize your flashcards into decks for easier study and review. 
                        Customize your decks with unique names and descriptions to keep your learning materials well-organized.
                    </Typography>
                </Card>
                <Card style={cardStyle} sx={{...cardsx}}>
                    <Image 
                        src={puzzle} 
                        alt="Puzzle Gif" 
                        style={{ width: '100px', height: 'auto'}} 
                    />
                    <Typography textAlign="center" fontWeight="bold" variant="h6">Personalized Learning Experience</Typography>
                    <Typography sx={{...cardTextsx}}>
                        Enhance your studying with our intelligent quiz features and AI-powered suggestions.
                    </Typography>
                </Card>
            </div>
        </div>
    )
}