import React, {useContext, useEffect, useRef, useState} from "react";
import {Button, Col, Image} from "react-bootstrap";
import HeaderNavBar from '../../components/headerNavBar/headerNavBar';
import {createUseStyles} from "react-jss";
import {Link, useParams, useNavigate} from "react-router-dom";
import axios from "axios";
import goldStar from "../../img/goldStar.svg";
import online from "../../img/online.svg";
import './HomeScreen.css';
import Star from "../../img/Star1.svg";
import stop from '../../img/stop.svg'
import play from '../../img/play.svg'
import quiet from '../../img/quiet.svg'
import loud from '../../img/loud.svg'
import silently from '../../img/silently.svg'
import nonePrev from "../../img/noneprev.png";
import nofavorite from "../../img/nofavorite.svg";
import favorite from "../../img/favorite.svg";
import errormsg from "../../img/errormsg.svg";
import share from "../../img/share.svg";
import {Context} from "../../index";
import SendErrorMessage from "../../components/modals/SendErrorMessage";

import {
    calculateAudioBitrate,
    fetchCurrentMusicName,
    fetchOneRadio,
    getAllCountries,
    getAllGenres,
    getRadios
} from "../../http/radioApi";
import Pages from "../../components/Pages/Pages";
import {observer} from "mobx-react-lite";
import Footer from "../../components/Footer/Footer";
import CreateGenre from "../../components/modals/CreateGenre";



const useStyles = createUseStyles({
    container: {
        minHeight: "100vh",
        backgroundColor: "#F1F1F1"
    },
});
const HomeScreen = observer(() => {
    const params = useParams();
    const classes = useStyles();
    const [selectedRadio, setSelectedRadio] = useState(null);
    const [radioOnline, setRadioOnline] = useState('');
    const {radioStation} = useContext(Context);
    const [selectGenre, setSelectGenre] = useState('');
    const [selectCountry, setSelectCountry] = useState('');
    const [selectLanguage, setSelectLanguage] = useState('');
    const [currentMusicName, setCurrentMusicName] = useState('Неизвестно');
    const [allReviews, setAllReviews] = useState(false);
    const [leaveReview, setLeaveReview] = useState(false);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [rating, setRating] = useState(0);
    const [ratingDesc, setRatingDesc] = useState({description: ""});
    const [ratingName, setRatingName] = useState({name: ""});
    const [volume, setVolume] = useState(50);
    const [bgSize, setBgSize] = useState('50% 100%');
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const [isReview, setIsReview] = useState(false);
    const navigation = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [sendError, setSendError] = useState(false)


    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    const lowerSound = () => {
        setVolume(0);
        setBgSize(`0% 100%`);
    }
    const upperSound = () => {
        setVolume(50);
        setBgSize(`50% 100%`);
    }


    useEffect(() => {
        getAllCountries().then(data => radioStation.setCountries(data))
        getAllGenres().then(data => radioStation.setGenres(data))
        getRadios(null, null, radioStation.page, radioStation.limit, '').then(data => {
                radioStation.setRadios(data[0])
                radioStation.setTotalCount(data[1])
            console.log('запрс из 1 useEffect')
            }
        )
    }, [])

    useEffect(() => {
            getRadios(radioStation.selectedCountry.id, radioStation.selectedGenre.id, radioStation.page, radioStation.limit, radioStation.searchName).then(data => {
                radioStation.setRadios(data[0])
                radioStation.setTotalCount(data[1])
                console.log('запрс из 2 useEffect')
            })
        }, [radioStation.page, radioStation.selectedCountry, radioStation.selectedGenre, radioStation.searchName]
    )

    useEffect(() => {
        if (typeof(params.radioId) !== "undefined"){
            fetchOneRadio(params.radioId).then(data => {
                setSelectedRadio(data[0]);
                setRadioOnline(data[0].online)
                setSelectGenre(data[1])
                setSelectCountry(data[2])
                setSelectLanguage(data[3])
                setIsPlaying(false);
                audioRef.current.play();
            });
        }
    }, []);

    useEffect(() => {
        if(selectedRadio!==null) {
            const interval = setInterval(() => {
                fetchCurrentMusicName(selectedRadio).then(data => {
                    setCurrentMusicName(data.StreamTitle);
                    console.log(data);
                });
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [selectedRadio]);

    const toggleRate = async (userid, rating, description, name) => {
        try {
            const url = `http://localhost:8081/addingRating/${userid}`;
            const {data: res} = await axios.put(url, {value: rating, description: description, name: name});
            setIsReview(true)
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = ({currentTarget: input}) => {
        const {name, value} = input;

        if (value.length <= 2000) {
            setRatingDesc({...ratingDesc, [name]: value});
        } else {
            setRatingDesc({...ratingDesc, [name]: value.slice(0, 2000)});
        }
    };
    const handleChangeName = ({currentTarget: input}) => {
        const {name, value} = input;
        setRatingName({...ratingName, [name]: value});
    };

    const handleAddRating = () => {
        toggleRate(selectedRadio._id, rating, ratingDesc.description, ratingName.name)
            .then(() => {
                setRating(0);
                setRatingDesc({description: ""});
                setRatingName({name: ""});
            })
            .catch(error => {
                console.log(error);
            });
    };
    const handleRate = (value) => {
        setRating(value);
    };

    /* eslint-disable no-restricted-globals */
    const getOneRadio = (r) => {
        if (r !== selectedRadio) {
            setSelectedRadio(r)
            calculateAudioBitrate(selectedRadio).then(data=>{
                console.log(data)
            })
            setLeaveReview(false)
            setAllReviews(false)
            fetchCurrentMusicName(r).then(data => {
                setCurrentMusicName(data.StreamTitle)
                console.log(data)
            })
            fetchOneRadio(r.id).then(data => {
                setRadioOnline(data[0].online)
                console.log(data[0].online)
                setSelectGenre(data[1])
                setSelectCountry(data[2])
                setSelectLanguage(data[3])
                setIsPlaying(true);
                audioRef.current.play();
            });
            navigation(`/${r.id}`)
        }
    }

    const togglePlayback = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    const handleVolumeChange = (event, num) => {
        const newValue = event.target.value;
        setVolume(newValue);
        setBgSize(`${newValue}% 100%`);
    };

    const copyLinkAndShowMessage = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl).then(r => {});
        setShowCopiedMessage(true);
        setTimeout(() => {
            setShowCopiedMessage(false);
        }, 1200);
    };
    const storedFavorites = localStorage.getItem('favorites');
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    // useEffect(() => {
    //     setIsFavorite(favorites.includes(selectedRadioId));
    // }, [favorites, selectedRadioId]);
    const handleAddToFavorites = (selectedRadioId) => {

        try {
            const index = favorites.indexOf(selectedRadioId);
            if (index !== -1) {
                favorites.splice(index, 1);
            } else {
                favorites.push(selectedRadioId);
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            setIsFavorite(favorites.includes(selectedRadioId));
            console.log(favorites);
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <>

            <div className={classes.container}>
                <HeaderNavBar/>

                <div className={'bestSpecialists'}>
                    {selectedRadio && (
                        <div style={{
                            width: "1060px",
                            display: 'flex',
                            justifyContent: "space-between",
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}>
                            <div className="radioBlock">
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: '20px'
                                    }}>
                                        <div>
                                            <div style={{position: 'relative', display: 'flex', flexDirection: 'row'}}>
                                                <div style={{
                                                    backgroundColor: '#ffffff',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    flexDirection: 'column',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                                        <img style={{width: '16px'}} src={online} alt="star"/>

                                                        <p style={{margin: '0 0 0 5px', fontSize: '14px'}}>
                                                            {radioOnline}
                                                        </p>
                                                    </div>
                                                    <Image width={140} height={125}
                                                           className="mt-1 rounded rounded-10 d-block mx-auto"
                                                           src={selectedRadio.image !== 'image' ? 'http://localhost:8081/' + selectedRadio.image : nonePrev}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{marginLeft: '20px'}}>
                                            <div style={{position: 'relative', display: 'flex', flexDirection: 'row'}}>


                                                <div style={{
                                                    backgroundColor: '#ffffff',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    justifyContent: 'space-between',
                                                    flexDirection: 'column',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        paddingBottom: '20px',
                                                        width: '150px',
                                                        borderBottom: '1px solid #E9E9E9'
                                                    }}>
                                                        {selectedRadio.rating && selectedRadio.rating.length > 0 && selectedRadio.rating[0] !== '' && (
                                                            <div style={{
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                alignItems: 'center'
                                                            }}>
                                                                <img style={{width: '12px'}} src={goldStar} alt="star"/>
                                                                <p style={{
                                                                    margin: '0 0 0 2px',
                                                                    fontSize: '13px',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    {(selectedRadio.rating.reduce((acc, rating) => acc + rating.value, 0) / selectedRadio.rating.length).toFixed(1)}
                                                                </p>
                                                                <p style={{margin: '0 0 0 5px', fontSize: '12px'}}>
                                                                    ({selectedRadio.rating.length} отзывов)
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h6 style={{fontWeight: 'bold'}}>{selectedRadio.title}</h6>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'row',
                                                        marginTop: '20px'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'space-between',
                                                            flexDirection: 'column',
                                                        }}>
                                                            <p style={{margin: '2px 0', fontSize: '12px'}}>Жанр</p>
                                                            <p style={{margin: '2px 0', fontSize: '12px'}}>Страна</p>
                                                            <p style={{margin: '2px 0', fontSize: '12px'}}>Язык</p>
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            justifyContent: 'space-between',
                                                            flexDirection: 'column',
                                                            margin: '0 0 0 10px'
                                                        }}>
                                                            <p style={{
                                                                margin: '2px 0',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold'
                                                            }}>{selectGenre.name}</p>
                                                            <p style={{
                                                                margin: '2px 0',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold'
                                                            }}>{selectCountry.name}</p>
                                                            <p style={{
                                                                margin: '2px 0',
                                                                fontSize: '12px',
                                                                fontWeight: 'bold'
                                                            }}>{selectLanguage.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="audio-player">
                                            <audio ref={audioRef} src={selectedRadio.radio}></audio>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginRight: '-20px'
                                            }}>
                                                <button className={`audio-play-btn `} onClick={togglePlayback}>
                                                    {isPlaying ? (
                                                        <img src={stop} alt="Stop" className="audio-icon"/>
                                                    ) : (
                                                        <img src={play} alt="Play" className="audio-icon"/>
                                                    )}
                                                </button>
                                                <div style={{marginLeft: '15px'}}>
                                                    <p style={{
                                                        fontSize: '12px',
                                                        fontWeight: '400',
                                                        margin: '1px 0'
                                                    }}>Сейчас играет</p>
                                                    <div style={{width: '200px', overflow: 'hidden'}}>
                                                        {currentMusicName.length > 32 ? (
                                                            <p style={{
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                margin: '1px 0',
                                                                animation: 'marquee 8s linear infinite',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'visible',
                                                                textOverflow: 'unset'
                                                            }}>
                                                                {currentMusicName}
                                                            </p>
                                                        ) : (
                                                            <p style={{
                                                                fontSize: '12px',
                                                                fontWeight: 'bold',
                                                                margin: '1px 0',
                                                            }}>
                                                                {currentMusicName}
                                                            </p>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                transform: 'rotate(270deg)',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    transform: 'rotate(90deg)',
                                                    marginRight: '10px',
                                                    marginTop: '8px',
                                                    width: '20px',
                                                    cursor: 'pointer'
                                                }}>
                                                    {volume <= 0 ? (
                                                        <img onClick={upperSound} style={{}} src={silently} alt="Stop"/>
                                                    ) : volume >= 80 ? (
                                                        <img onClick={lowerSound} src={loud} alt="Play"/>
                                                    ) : (
                                                        <img onClick={lowerSound} src={quiet} alt="Play"/>
                                                    )}
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    className="vertical-slider"
                                                    style={{backgroundSize: bgSize}}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div onClick={() => handleAddToFavorites(selectedRadio._id)} style={{
                                backgroundColor: '#fff',
                                width: '100px',
                                height: '100px',
                                boxShadow: '0px 0px 18px rgba(133, 133, 133, 0.2',
                                display:'flex',
                                padding:'15px 0',
                                flexDirection:'column',
                                borderRadius:'10px',
                                alignContent:'center',
                                justifyContent:'space-between',
                                alignItems:'center',
                                cursor:'pointer'
                            }}>
                                <img style={{width:'30px', height:'30px'}} src={favorites.includes(selectedRadio._id) ? favorite : nofavorite}/>
                                <p style={{margin:' 0', fontSize:'12px', textAlign:'center'}}>Добавить <br /> в избранное</p>
                            </div>
                            <div onClick={() => setSendError(true)} style={{
                                backgroundColor: '#fff',
                                width: '100px',
                                height: '100px',
                                boxShadow: '0px 0px 18px rgba(133, 133, 133, 0.2',
                                display:'flex',
                                padding:'15px 0',
                                flexDirection:'column',
                                borderRadius:'10px',
                                justifyContent:'space-between',
                                alignItems:'center',
                                cursor:'pointer'
                            }}>
                                <img style={{width:'30px', height:'30px'}} src={errormsg}/>
                                <p style={{margin:'0', fontSize:'12px', textAlign:'center'}}>Радио  <br /> не работает</p>
                            </div>
                            <div style={{width:'100px', display:'flex', flexDirection:'column'}}>
                                <div style={{
                                    backgroundColor: '#fff',
                                    width: '100px',
                                    height: '100px',
                                    boxShadow: '0px 0px 18px rgba(133, 133, 133, 0.2',
                                    display:'flex',
                                    padding:'15px 0 25px 0',
                                    flexDirection:'column',
                                    borderRadius:'10px',
                                    justifyContent:'space-between',
                                    alignItems:'center',
                                    cursor:'pointer',
                                    position: 'relative',
                                    zIndex: '1',
                                }}
                                     onClick={copyLinkAndShowMessage}
                                >
                                    <img style={{width:'30px', height:'30px'}} src={share}/>
                                    <p style={{margin:'0', fontSize:'12px', textAlign:'center'}}>Поделиться</p>
                                </div>
                                <div>
                                    {showCopiedMessage && (
                                        <div style={{
                                            backgroundColor: '#fff',
                                            width: '100px',
                                            borderRadius: '10px',
                                            marginTop: '10px',
                                            padding: '5px 10px',
                                            boxShadow: '0px 0px 18px rgba(133, 133, 133, 0.2)',
                                            fontSize: '12px',
                                            textAlign: 'center',
                                            position: 'absolute',
                                            zIndex: '0',
                                            animation: showCopiedMessage
                                                ? 'slideIn 0.3s forwards'
                                                : 'slideOut 0.3s backwards',
                                        }}>
                                            Ссылка скопирована!
                                        </div>
                                    )}
                                </div>
                                <SendErrorMessage show={sendError} onHide={() => setSendError(false)} title={selectedRadio.title}/>
                            </div>
                        </div>
                    )}
                    <h2 style={{margin: '20px 0 10px 10px'}}>{`Похожие станции`}</h2>
                    <div
                        style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start'}}>
                        {radioStation.radios.map((radio) => (
                            <div className={'oneBestSpecialistsBlock'} key={radio.id}
                                 onClick={() => getOneRadio(radio)}>
                                <Link style={{
                                    textDecoration: "none",
                                    color: "#000",
                                    flexDirection: 'column',
                                    height: '100%',
                                    width: '100%'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignContent: 'space-between'
                                    }}>
                                        <div style={{position: 'relative', display: 'flex', flexDirection: 'row'}}>
                                            {radio.rating && radio.rating.length > 0 && radio.rating[0] !== '' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 1,
                                                    left: 1,
                                                    backgroundColor: '#ffffff',
                                                    padding: '13px 5px 1px 12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    borderRadius: '8px'
                                                }}>
                                                    <img style={{width: '12px'}} src={goldStar} alt="star"/>
                                                    <p style={{margin: '0 0 0 2px', fontSize: '13px'}}>
                                                        {(radio.rating.reduce((acc, rating) => acc + rating.value, 0) / radio.rating.length).toFixed(1)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            marginTop: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            alignContent: 'space-around'
                                        }}>
                                            <Image width={140} height={125}
                                                   className="mt-1 rounded rounded-10 d-block mx-auto"
                                                   src={radio.image !== 'image' ? 'http://localhost:8081/' + radio.image : nonePrev}/>

                                        </div>
                                    </div>
                                    <div style={{
                                        marginTop: '10px',
                                        paddingTop: '2px',
                                        borderTop: "1px solid #EAEAEA",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        alignContent: 'space-around'
                                    }}>
                                        <p className="mx-auto" style={{fontWeight: '500', margin: '5px 0 0 0'}}>
                                            {radio.title}
                                        </p>
                                    </div>

                                </Link>
                            </div>
                        ))}
                    </div>
                    <Pages/>
                    {selectedRadio && (
                        <div className="largeRadioBlock">
                            <h2 style={{margin: '20px 0 10px 10px'}}>{`Отзывы`}</h2>
                            {leaveReview ?
                                <div style={{position: 'relative', zIndex: 99, marginBottom: '10px'}}>
                                    <div style={{
                                        margin: '0 10px 0 10px',
                                        width: '1050px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'column'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <h4 style={{margin: '0'}}>Оценить:</h4>
                                            <div>
                                                <img onClick={() => handleRate(1)} style={{marginRight: '15px',}}
                                                     src={rating >= 1 ? goldStar : Star} alt={'Star'}/>
                                                <img onClick={() => handleRate(2)} style={{marginRight: '15px',}}
                                                     src={rating >= 2 ? goldStar : Star} alt={'Star'}/>
                                                <img onClick={() => handleRate(3)} style={{marginRight: '15px',}}
                                                     src={rating >= 3 ? goldStar : Star} alt={'Star'}/>
                                                <img onClick={() => handleRate(4)} style={{marginRight: '15px',}}
                                                     src={rating >= 4 ? goldStar : Star} alt={'Star'}/>
                                                <img onClick={() => handleRate(5)} style={{}}
                                                     src={rating >= 5 ? goldStar : Star} alt={'Star'}/>
                                            </div>
                                        </div>

                                        <div style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            marginTop: '5px'
                                        }}>
                                            <input
                                                type="text"
                                                placeholder="Имя"
                                                name="name"
                                                onChange={handleChangeName}
                                                value={ratingName.name}
                                                required
                                                className="input"
                                            />
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                        <textarea
                                            placeholder={rating === 0 ? "Поставьте оценку перед написанием комментария" : "Напишите комментарий к оценке"}
                                            name="description"
                                            onChange={handleChange}
                                            value={ratingDesc.description}
                                            required
                                            className="inputTop"
                                            style={{height: '50px', margin: '10px 0 0 0'}}
                                            disabled={rating === 0}
                                        />
                                        </div>
                                        <button onClick={handleAddRating} className="submit_btn"
                                                style={{width: '100%', margin: '15px 10px'}}>
                                            Добавить отзыв
                                        </button>
                                    </div>
                                </div>
                                : null}
                            <div style={{margin: '10px 0 13px 10px', width: '1050px', overflow: 'auto'}}>
                                {allReviews ?
                                    selectedRadio.rating.map((rating, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            flexDirection: 'column',
                                            padding: "10px 10px",
                                            backgroundColor: '#fff',
                                            borderRadius: '10px',
                                            textDecoration: "none",
                                            color: "#000000",
                                            marginBottom: '10px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                width: '100%',
                                                flexDirection: 'row',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center'
                                            }}>
                                                <p style={{
                                                    margin: '0px',
                                                    fontWeight: '700',
                                                    color: '#000',
                                                    fontSize: '14px'
                                                }}>{rating.name}</p>
                                                <div
                                                    style={{display: 'flex', flexDirection: 'row', marginLeft: '15px'}}>
                                                    <img src={goldStar} alt="Star"
                                                         style={{marginRight: '5px', width: '18px'}}/>
                                                    <p style={{margin: '0px', fontWeight: '500',}}>{rating.value}</p>
                                                </div>
                                            </div>
                                            <p style={{
                                                wordWrap: "break-word",
                                                color: '#000',
                                                margin: '5px 5px 5px 0',
                                                fontSize: '13px'
                                            }}>
                                                {rating.description}
                                            </p>

                                        </div>
                                    ))
                                    :
                                    selectedRadio.rating.slice(0, 2).map((rating, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            flexDirection: 'column',
                                            padding: "10px 10px",
                                            backgroundColor: '#fff',
                                            borderRadius: '10px',
                                            textDecoration: "none",
                                            color: "#000000",
                                            marginBottom: '10px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                width: '100%',
                                                flexDirection: 'row',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center'
                                            }}>
                                                <p style={{
                                                    margin: '0px',
                                                    fontWeight: '700',
                                                    color: '#000',
                                                    fontSize: '14px'
                                                }}>{rating.name}</p>
                                                <div
                                                    style={{display: 'flex', flexDirection: 'row', marginLeft: '15px'}}>
                                                    <img src={goldStar} alt="Star"
                                                         style={{marginRight: '5px', width: '18px'}}/>
                                                    <p style={{margin: '0px', fontWeight: '500',}}>{rating.value}</p>
                                                </div>
                                            </div>
                                            <p style={{
                                                wordWrap: "break-word",
                                                color: '#000',
                                                margin: '5px 5px 5px 0',
                                                fontSize: '13px'
                                            }}>
                                                {rating.description}
                                            </p>
                                        </div>))
                                }
                                <Col className="d-flex justify-content-between">
                                    <Button
                                        variant={"outline-dark"}
                                        style={{width: 'calc(50% - 8px)'}}
                                        className="admin-additional-button"
                                        onClick={() => setAllReviews(true)}
                                    >
                                        Читать все отзывы
                                    </Button>
                                    <Button
                                        variant={"outline-dark"}
                                        style={{width: 'calc(50% - 8px)'}}
                                        className="main-admin-button"
                                        onClick={() => setLeaveReview(true)}
                                    >
                                        Оставить отзыв
                                    </Button>
                                </Col>
                            </div>
                        </div>
                    )}

                </div>
                <Footer/>
            </div>
        </>
    );
})

export default HomeScreen;
