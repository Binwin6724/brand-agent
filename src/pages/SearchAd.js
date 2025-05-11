import React, { useState, useRef } from 'react'
import Modal from 'react-bootstrap/Modal';
import ReactMarkdown from 'react-markdown';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import noAsset from '../assets/no.png';

function SearchAd() {
    const [show, setShow] = useState(false);
    const [query, setQuery] = useState("");
    const [country, setCountry] = useState("US");
    const [adType, setAdType] = useState("ALL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const debounceRef = useRef();
    const [selectedAdIndices, setSelectedAdIndices] = useState([]);
    const [selectedAdBodies, setSelectedAdBodiesState] = useState([]);
    const [selectedAdCTAs, setSelectedAdCTAs] = useState([]);
    const [selectedAdvertiser, setSelectedAdvertiser] = useState(null);
    const [selectedAdBodiesData, setSelectedAdBodiesData] = useState({ loading: false, error: null, data: null })
    const [generateLoading, setGenerateLoading] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleCountryChange = (e) => setCountry(e.target.value);
    const handleAdTypeChange = (e) => setAdType(e.target.value);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setError(null);
        setResults([]);
        // Clear previous data when starting a new search
        setSelectedAdvertiser(null);
        setSelectedAdIndices([]);
        setSelectedAdBodiesState([]);
        setSelectedAdCTAs([]);
        setSelectedAdBodiesData({ loading: false, error: null, data: null });
        setGenerateResult(null);
        
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.length < 2) return; // Only search for 2+ chars
        debounceRef.current = setTimeout(() => {
            fetchResults(val, country, adType);
        }, 500);
    };

    const fetchResults = async (q, c, a) => {
        setLoading(true);
        setError(null);
        setResults([]);
        try {
            const resp = await fetch(`http://127.0.0.1:5000/search?q=${encodeURIComponent(q)}&country=${c}&ad_type=${a}`);
            if (!resp.ok) throw new Error('API error');
            const data = await resp.json();
            const pageResults = data?.results?.data?.ad_library_main?.typeahead_suggestions?.page_results || [];
            setResults(pageResults);
        } catch (err) {
            setError('Failed to fetch results.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdvertiserClick = async (pageId, brand) => {
        setSelectedAdvertiser(brand);
        setSelectedAdBodiesData({ loading: true, error: null, data: null });
        try {
            const resp = await fetch(`http://127.0.0.1:5000/page?page_id=${encodeURIComponent(pageId)}&ad_type=${adType}&country=${country}&brand=${brand}`);
            if (!resp.ok) throw new Error('API error');
            const data = await resp.json();
            setSelectedAdBodiesData({ loading: false, error: null, data: data.ad_bodies });
        } catch (err) {
            setSelectedAdBodiesData({ loading: false, error: 'Failed to fetch page details.', data: null });
        }
    };

    const handleBackToSearch = () => {
        setSelectedAdvertiser(null);
        // Clear all selection and results when going back to search
        setSelectedAdIndices([]);
        setSelectedAdBodiesState([]);
        setSelectedAdCTAs([]);
        setSelectedAdBodiesData({ loading: false, error: null, data: null });
        setGenerateResult(null);
    };

    const handleSelectAdBody = (ad, idx) => {
        setGenerateResult(null); // Clear previous result
        setSelectedAdIndices(prev => {
            if (prev.includes(idx)) {
                // Remove if already selected
                const updated = prev.filter(i => i !== idx);
                setSelectedAdBodiesState(bodies => bodies.filter((_, j) => prev[j] !== idx));
                setSelectedAdCTAs(ctas => ctas.filter((_, j) => prev[j] !== idx));
                console.log("Selected ad bodies", selectedAdBodies);
                return updated;
            } else {
                // Add to selection
                setSelectedAdBodiesState(bodies => [...bodies, ad.body]);
                setSelectedAdCTAs(ctas => [...ctas, ad.cta_text || ""]);
                console.log("Selected ad bodies", selectedAdBodies);
                return [...prev, idx];
            }
        });
    };

    const handleGenerate = async () => {
        if (selectedAdIndices.length === 0) return;
        setGenerateLoading(true);
        setGenerateResult(null);
        try {
            const resp = await fetch('http://127.0.0.1:5000/brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ad_bodies: selectedAdBodies, 
                    ad_ctas: selectedAdCTAs,
                    brand: selectedAdvertiser 
                })
            });
            if (!resp.ok) throw new Error('API error');
            const data = await resp.json();
            setGenerateResult(data);
        } catch (err) {
            setGenerateResult({ error: 'Failed to generate.' });
        } finally {
            setGenerateLoading(false);
        }
    };

    return (
        <div>
            <h1 className="page-title">Brand</h1>
            <div className="search-ads-container">
                <h2>Search Your Brand</h2>
                <p style={{ display: 'none' }}>Set your location and choose an ad category to start your search. <span className="search-tips-link" onClick={handleShow}>View search tips.</span></p>
                <p>We use the Facebook Ad Library to search for your brand and gather information about your recently published ads. This helps our system automatically retrieve key details, reducing the time required for you to fill out the form.</p>
                <div className="search-controls">
                    <select style={{ display: 'none' }} className="search-select country-select" value={country} onChange={handleCountryChange}>
                        <option value="ALL">All countries</option>
                        <option value="BR">Brazil</option>
                        <option value="IN">India</option>
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="AR">Argentina</option>
                        <option value="AU">Australia</option>
                        <option value="AT">Austria</option>
                        <option value="BE">Belgium</option>
                        <option value="CL">Chile</option>
                        <option value="CN">China</option>
                        <option value="CO">Colombia</option>
                        <option value="HR">Croatia</option>
                        <option value="DK">Denmark</option>
                        <option value="DO">Dominican Republic</option>
                        <option value="EG">Egypt</option>
                        <option value="FI">Finland</option>
                        <option value="FR">France</option>
                        <option value="DE">Germany</option>
                        <option value="GR">Greece</option>
                        <option value="HK">Hong Kong</option>
                        <option value="ID">Indonesia</option>
                        <option value="IE">Ireland</option>
                        <option value="IL">Israel</option>
                        <option value="IT">Italy</option>
                        <option value="JP">Japan</option>
                        <option value="JO">Jordan</option>
                        <option value="KW">Kuwait</option>
                        <option value="LB">Lebanon</option>
                        <option value="MY">Malaysia</option>
                        <option value="MX">Mexico</option>
                        <option value="NL">Netherlands</option>
                        <option value="NZ">New Zealand</option>
                        <option value="NG">Nigeria</option>
                        <option value="NO">Norway</option>
                        <option value="PK">Pakistan</option>
                        <option value="PA">Panama</option>
                        <option value="PE">Peru</option>
                        <option value="PH">Philippines</option>
                        <option value="PL">Poland</option>
                        <option value="RU">Russia</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="RS">Serbia</option>
                        <option value="SG">Singapore</option>
                        <option value="ZA">South Africa</option>
                        <option value="KR">South Korea</option>
                        <option value="ES">Spain</option>
                        <option value="SE">Sweden</option>
                        <option value="CH">Switzerland</option>
                        <option value="TW">Taiwan</option>
                        <option value="TH">Thailand</option>
                        <option value="TR">Turkey</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="VE">Venezuela</option>
                        <option value="PT">Portugal</option>
                        <option value="LU">Luxembourg</option>
                        <option value="BG">Bulgaria</option>
                        <option value="CZ">Czech Republic</option>
                        <option value="SI">Slovenia</option>
                        <option value="IS">Iceland</option>
                        <option value="SK">Slovakia</option>
                        <option value="LT">Lithuania</option>
                        <option value="TT">Trinidad and Tobago</option>
                        <option value="BD">Bangladesh</option>
                        <option value="LK">Sri Lanka</option>
                        <option value="KE">Kenya</option>
                        <option value="HU">Hungary</option>
                        <option value="MA">Morocco</option>
                        <option value="CY">Cyprus</option>
                        <option value="JM">Jamaica</option>
                        <option value="EC">Ecuador</option>
                        <option value="RO">Romania</option>
                        <option value="BO">Bolivia</option>
                        <option value="GT">Guatemala</option>
                        <option value="CR">Costa Rica</option>
                        <option value="QA">Qatar</option>
                        <option value="SV">El Salvador</option>
                        <option value="HN">Honduras</option>
                        <option value="NI">Nicaragua</option>
                        <option value="PY">Paraguay</option>
                        <option value="UY">Uruguay</option>
                        <option value="PR">Puerto Rico</option>
                        <option value="BA">Bosnia and Herzegovina</option>
                        <option value="PS">Palestinian Territory</option>
                        <option value="TN">Tunisia</option>
                        <option value="BH">Bahrain</option>
                        <option value="VN">Vietnam</option>
                        <option value="GH">Ghana</option>
                        <option value="MU">Mauritius</option>
                        <option value="UA">Ukraine</option>
                        <option value="MT">Malta</option>
                        <option value="BS">Bahamas</option>
                        <option value="MV">Maldives</option>
                        <option value="OM">Oman</option>
                        <option value="MK">Macedonia</option>
                        <option value="LV">Latvia</option>
                        <option value="EE">Estonia</option>
                        <option value="IQ">Iraq</option>
                        <option value="DZ">Algeria</option>
                        <option value="AL">Albania</option>
                        <option value="NP">Nepal</option>
                        <option value="MO">Mongolia</option>
                        <option value="ME">Montenegro</option>
                        <option value="SN">Senegal</option>
                        <option value="GE">Georgia</option>
                        <option value="BN">Brunei</option>
                        <option value="UG">Uganda</option>
                        <option value="GP">Guadeloupe</option>
                        <option value="BB">Barbados</option>
                        <option value="AZ">Azerbaijan</option>
                        <option value="TZ">Tanzania</option>
                        <option value="LY">Libya</option>
                        <option value="MQ">Martinique</option>
                        <option value="CM">Cameroon</option>
                        <option value="BW">Botswana</option>
                        <option value="ET">Ethiopia</option>
                        <option value="KZ">Kazakhstan</option>
                        <option value="NA">Namibia</option>
                        <option value="MG">Madagascar</option>
                        <option value="NC">New Caledonia</option>
                        <option value="MD">Moldova</option>
                        <option value="FJ">Fiji</option>
                        <option value="BY">Belarus</option>
                        <option value="JE">Jersey</option>
                        <option value="GU">Guam</option>
                        <option value="YE">Yemen</option>
                        <option value="ZM">Zambia</option>
                        <option value="IM">Isle of Man</option>
                        <option value="HT">Haiti</option>
                        <option value="KH">Cambodia</option>
                        <option value="AW">Aruba</option>
                        <option value="PF">French Polynesia</option>
                        <option value="AF">Afghanistan</option>
                        <option value="BM">Bermuda</option>
                        <option value="GY">Guyana</option>
                        <option value="AM">Armenia</option>
                        <option value="MW">Malawi</option>
                        <option value="AG">Antigua and Barbuda</option>
                        <option value="RW">Rwanda</option>
                        <option value="GG">Guernsey</option>
                        <option value="GM">Gambia</option>
                        <option value="FO">Faroe Islands</option>
                        <option value="LC">Saint Lucia</option>
                        <option value="KY">Cayman Islands</option>
                        <option value="BJ">Benin</option>
                        <option value="AD">Andorra</option>
                        <option value="GD">Grenada</option>
                        <option value="VI">Virgin Islands, U.S.</option>
                        <option value="BZ">Belize</option>
                        <option value="VC">Saint Vincent and the Grenadines</option>
                        <option value="MN">Mongolia</option>
                        <option value="MZ">Mozambique</option>
                        <option value="ML">Mali</option>
                        <option value="AO">Angola</option>
                        <option value="GF">French Guiana</option>
                        <option value="UZ">Uzbekistan</option>
                        <option value="DJ">Djibouti</option>
                        <option value="BF">Burkina Faso</option>
                        <option value="MC">Monaco</option>
                        <option value="TG">Togo</option>
                        <option value="GL">Greenland</option>
                        <option value="GA">Gabon</option>
                        <option value="GI">Gibraltar</option>
                    </select>
                    <select style={{ display: 'none' }} className="search-select category-select" value={adType} onChange={handleAdTypeChange}>
                        <option value="ALL">All Ads</option>
                        <option value="POLITICS">Issues, elections or politics</option>
                    </select>
                    <div className="search-input-wrapper">
                        <span className="search-icon" role="img" aria-label="search">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Type advertiser name..."
                            value={query}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                {/* Results Section - Only show when no advertiser is selected */}
                {!selectedAdvertiser && (
                    <div className="results-section">
                        {loading && <div className="loading">Loading...</div>}
                        {error && <div className="error">{error}</div>}
                        {!loading && !error && results.length > 0 && (
                            <div>
                                <h3 className="advertisers-title">Advertisers</h3>
                                <div className="advertiser-list">
                                    {results.map((adv, idx) => (
                                        <div
                                            className="advertiser-card"
                                            key={adv.page_id || idx}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => adv.page_id && handleAdvertiserClick(adv.page_id, adv.name)}
                                        >
                                            <img className="advertiser-logo" src={adv.image_uri} alt={adv.name} />
                                            <div className="advertiser-info">
                                                <div className="advertiser-name">{adv.name}</div>
                                                <div className="advertiser-socials">
                                                    {adv.page_alias && (
                                                        <span className="social-row">
                                                            <span className="social-icon fb">f</span>
                                                            @{adv.page_alias} {adv.likes && (<span className="dot">·</span>)}
                                                            {adv.likes && <span className="followers">{formatFollowers(adv.likes)} follow this</span>}
                                                        </span>
                                                    )}
                                                    {adv.ig_username && (
                                                        <span className="social-row">
                                                            <span className="social-icon ig">&#x1F4F7;</span>
                                                            @{adv.ig_username} {adv.ig_verification && <span className="verified">✔️</span>} {adv.ig_followers && (<span className="dot">·</span>)}
                                                            {adv.ig_followers && <span className="followers">{formatFollowers(adv.ig_followers)} followers</span>}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!loading && !error && query.length > 1 && results.length === 0 && (
                            <div className="no-results">No advertisers found.</div>
                        )}
                    </div>
                )}

                {/* Brand Information Section */}
                {selectedAdvertiser && (
                    <div className="brand-info-container">
                        <div className="brand-info-header">
                            <button
                                className="back-button"
                                onClick={handleBackToSearch}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0066cc',
                                    cursor: 'pointer',
                                    fontSize: '0.9em',
                                    padding: '5px 10px',
                                    marginBottom: '15px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                ← Back to search
                            </button>
                        </div>

                        {selectedAdBodiesData.loading && <div className="loading">Loading ad bodies...</div>}
                        {selectedAdBodiesData.error && <div className="error">{selectedAdBodiesData.error}</div>}
                        {selectedAdBodiesData.data && !generateResult && (
                            <div className='ad-body'>
                                <Row xs={1} md={3} className="g-4">
                                    {selectedAdBodiesData.data.map((ad, index) => (
                                        <CardGroup key={index}>
                                            <Card
                                                style={{
                                                    maxWidth: '350px',
                                                    border: selectedAdIndices.includes(index) ? '2px solid #005eff' : '1px solid #ddd',
                                                    boxShadow: selectedAdIndices.includes(index) ? '0 0 8px #005eff33' : 'none',
                                                    cursor: 'pointer',
                                                    opacity: generateLoading ? 0.7 : 1
                                                }}
                                                onClick={() => handleSelectAdBody(ad, index)}
                                            >
                                                {(() => {
                                                    const assetUrl = ad.asset;
                                                    if (!assetUrl) {
                                                        return <Card.Img variant="top" src={noAsset} style={{ maxHeight: '350px', objectFit: 'contain' }} />;
                                                    }
                                                    // List of common video extensions
                                                    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
                                                    // Check if URL contains a video extension (anywhere in the URL)
                                                    const isVideo = videoExtensions.some(ext => assetUrl.toLowerCase().includes(ext)) || assetUrl.includes('/video');
                                                    if (isVideo) {
                                                        return (
                                                            <video controls width="100%" height="auto" style={{ maxHeight: '350px' }}>
                                                                <source src={assetUrl} />
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        );
                                                    } else {
                                                        return <Card.Img variant="top" src={assetUrl} style={{ maxHeight: '350px', objectFit: 'contain' }} />;
                                                    }
                                                })()}
                                                <Card.Body>
                                                    <Card.Text>
                                                        {ad.body}
                                                    </Card.Text>
                                                </Card.Body>
                                                <Card.Footer>
                                                    {ad.cta_text && (
                                                        <Button variant="outline-primary" style={{ borderRadius: '10px', border: '1px solid rgb(150, 150, 150)', color: 'black' }}>{ad.cta_text}</Button>
                                                    )}
                                                </Card.Footer>
                                            </Card>
                                        </CardGroup>
                                    ))}
                                </Row>
                                {/* Generate Button */}
                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <Button
                                        variant="primary"
                                        disabled={selectedAdIndices.length === 0 || generateLoading}
                                        onClick={handleGenerate}
                                    >
                                        {generateLoading ? 'Generating...' : 'Generate'}
                                    </Button>
                                </div>
                            </div>)
                        }

                        {generateResult && !generateResult.loading && (
                            <ReactMarkdown>{generateResult.response}</ReactMarkdown>)
                        }



                    </div>
                )}
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Search tips</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><b>Targeting data for ads about social issues, elections or politics</b> <br />
                        Choose a country and select <b>Issues, elections or politics</b> from the ad category filter. Type the name of an advertiser into the search bar and select their Page from the drop-down menu. <br />
                        Once on the advertiser Page, select the Audience tab to view targeting data.<br /><br />
                        <b>Location and ad category</b><br />
                        Before you search, set your location and choose an ad category so that we know where you want to search and what type of ad you're looking for.<br /><br />
                        <b>Exact phrase</b><br />
                        Use quotations so that we know you're looking for these words in this specific order. "Mary likes cheese sandwiches"<br /><br />
                        You can also search for more than one exact phrase. "Mary likes cheese sandwiches" "on rye bread"<br /><br />
                        <b>Words in any order</b><br />
                        Find ads that contain all of these words but not necessarily in order.<br />
                        | Sandwiches | Cheese | Mary |
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    )
}
// Helper to format followers, e.g., 2.1M
function formatFollowers(num) {
    if (!num) return null;
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num;
}

export default SearchAd