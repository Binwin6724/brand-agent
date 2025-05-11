import React from 'react'
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';
import './Experiences.css'
import image from '../assets/image-21.jpg'
import Button from 'react-bootstrap/Button';
function Experiences() {
    const experiences = [
        { title: 'Adobe Photoshop Magic', description: 'Transform your photos with AI-powered editing tools in Adobe Photoshop.', imageSrc: image, cta: 'Learn More' },
        { title: 'Creative Cloud for Teams', description: 'Boost collaboration with Adobe Creative Cloud—perfect for marketing and design teams.', imageSrc: image, cta: 'Read More' },
        { title: 'Adobe Premiere Pro Speed', description: 'Edit videos faster than ever with Adobe Premiere Pro’s smart editing features.', imageSrc: image, cta: 'Learn More' },
        { title: 'Adobe Firefly for Creators', description: 'Generate stunning visuals and text effects using generative AI in Adobe Firefly.', imageSrc: image, cta: 'Learn More' },
        { title: 'All Apps, One Subscription', description: 'Get 20+ creative apps including Photoshop, Illustrator, and After Effects with one Creative Cloud plan.', imageSrc: image, cta: 'View All' }
    ]

    return (
        <div className='experiences-container'>
            <h2 className='experiences-title'>Experiences</h2>
            <div className='experiences-content'>
                <Row xs={1} md={3} className="g-4">
                    {experiences.map((experience, index) => (
                        <CardGroup key={index}>
                            <Card>
                                <Card.Img variant="top" src={experience.imageSrc} />
                                <Card.Body>
                                    <Card.Title>{experience.title}</Card.Title>
                                    <Card.Text>
                                        {experience.description}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <Button variant="outline-primary" style={{ borderRadius: '10px', border: '1px solid rgb(150, 150, 150)', color: 'black' }}>{experience.cta}</Button>
                                </Card.Footer>
                            </Card>
                        </CardGroup>
                    ))}
                </Row>
            </div>
        </div>
    )
}

export default Experiences