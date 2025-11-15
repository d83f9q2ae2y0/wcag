import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import { useId } from 'react';

export default function MultiActionAreaCard() {
  const id = useId(); // unique id pour associer titre/description (aria)
  const titleId = `card-title-${id}`;
  const descId = `card-desc-${id}`;

  return (
    // RGAA 9.2 / 9.1 : utilisation d'un élément sémantique pour la structure de l'information (article)
    <Card component="article" sx={{ maxWidth: 345 }} aria-labelledby={titleId}>
      {/* 
        RGAA 4.1.2 (9.4.1.2) : Ajout d'aria-labelledby et aria-describedby pour fournir
        un nom et une description programmatique au contrôle cliquable.
        Correction : aria-labelledby / aria-describedby pointent vers le titre et la description.
      */}
      <CardActionArea
        // CardActionArea rend un véritable élément focalisable ; on donne un nom programmatique via aria-labelledby
        aria-labelledby={titleId}
        aria-describedby={descId}
        sx={{
          // RGAA 9.2.4.7 / 10.7 : garantie d'un indicateur de focus visible (style d'auteur si le natif est supprimé)
          '&:focus-visible': {
            outline: '3px solid Highlight', // laisse le système choisir une couleur accessible
            outlineOffset: '3px',
            borderRadius: 1,
          },
        }}
      >
        {/* 
          RGAA 1.2 / 1.1 : Définition de l'attribut alt.
          -> Ici l'image est illustrative (titre + texte fournissent l'info). 
             Nous la marquons donc décorative : alt="" (ignorable par AT).
             Si tu veux que l'image soit informative, remplacer alt="" par une alternative pertinente.
        */}
        <CardMedia
          component="img"
          height="140"
          image="/static/images/cards/contemplative-reptile.jpg"
          alt="" // RGAA 1.2 : image décorative, alt vide pour être ignorée
          // role presentation n'est pas strictement nécessaire si alt="" mais peut être ajouté :
          role="img"
          aria-hidden={false} /* alt="" suffit ; aria-hidden=false here — keep consistent */
        />
        <CardContent>
          {/* 
            RGAA 9.1 : utilisation d'un titre sémantique (h3) avec id pour être référencé.
            Correction : Typography rendu en <h3> (ou h2 selon plan de titres du document).
          */}
          <Typography gutterBottom variant="h5" component="h3" id={titleId}>
            Lizard
          </Typography>

          {/* 
            RGAA 3.2 : Assurer un contraste suffisant.
            Correction : force color 'text.primary' (contraste élevé par défaut dans le thème MUI).
            Si tu veux conserver une couleur secondaire, vérifier le ratio (>=4.5:1 pour texte normal).
          */}
          <Typography
            variant="body2"
            id={descId}
            sx={{ color: 'text.primary' }}
          >
            Lizards are a widespread group of squamate reptiles, with over 6,000
            species, ranging across all continents except Antarctica
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions>
        {/* 
          RGAA 4.1.2 : Le bouton a un libellé visible ("Share") -> nom programmatique assuré.
          RGAA 9.2.4.7 / 10.7 : garantir visibilité du focus (focus-visible ajouté).
          Correction : ajout sx focus-visible pour s'assurer d'un indicateur si le thème l'enlève.
        */}
        <Button
          size="small"
          color="primary"
          sx={{
            '&:focus-visible': {
              outline: '3px solid Highlight',
              outlineOffset: '3px',
              borderRadius: 1,
            },
          }}
        >
          Share
        </Button>
      </CardActions>
    </Card>
  );
}
