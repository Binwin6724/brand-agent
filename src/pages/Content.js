import React from 'react'
import './Content.css'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SWrong from '../components/SWrong';
import Assets from '../components/Assets';
import Experiences from '../components/Experiences';
function Content() {
    const tabs = [
        { key: 'assets', title: 'Assets', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="img" className="  . _8-3t1x -rwx0fg_e-b"><path fill="var(--iconPrimary, var(--lightningcss-light, rgb(41, 41, 41)) var(--lightningcss-dark, rgb(219, 219, 219)))" d="M11.664 4.921c0 .696-.578 1.26-1.292 1.26S9.08 5.617 9.08 4.921s.578-1.26 1.292-1.26 1.292.564 1.292 1.26M16.75 19h-6.5C9.01 19 8 17.99 8 16.75v-6.5C8 9.01 9.01 8 10.25 8h6.5C17.99 8 19 9.01 19 10.25v6.5c0 1.24-1.01 2.25-2.25 2.25m-6.5-9.5c-.413 0-.75.337-.75.75v6.5c0 .413.337.75.75.75h6.5c.413 0 .75-.337.75-.75v-6.5c0-.413-.337-.75-.75-.75z"></path><path fill="var(--iconPrimary, var(--lightningcss-light, rgb(41, 41, 41)) var(--lightningcss-dark, rgb(219, 219, 219)))" d="M12 15.132v-2.907c0-.429.414-.69.733-.463l2.35 1.453c.301.214.301.712 0 .926l-2.35 1.453c-.319.228-.733-.034-.733-.462M13.022 1H2.978C1.887 1 1 1.901 1 3.01v7.98C1 12.1 1.887 13 2.978 13H5.75c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H2.978c-.264 0-.478-.229-.478-.51v-.773l2.595-2.53c.165-.162.445-.164.604-.008l.478.477c.293.293.767.293 1.06 0s.293-.767 0-1.06l-.484-.485c-.742-.725-1.956-.726-2.704 0L2.5 8.122V3.01c0-.281.214-.51.478-.51h10.044c.264 0 .478.229.478.51V5.7c0 .414.336.75.75.75s.75-.336.75-.75V3.01C15 1.9 14.113 1 13.022 1"></path></svg>, 
            content: <Assets />
         },
        { key: 'experiences', title: 'Experiences', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="img" className="  . _8-3t1x -rwx0fg_e-b"><path fill="var(--iconPrimary, var(--lightningcss-light, rgb(41, 41, 41)) var(--lightningcss-dark, rgb(219, 219, 219)))" d="M15.75 2H4.25C3.01 2 2 3.01 2 4.25v11.5C2 16.99 3.01 18 4.25 18h11.5c1.24 0 2.25-1.01 2.25-2.25V4.25C18 3.01 16.99 2 15.75 2m-1.313 11.357c-.742-.634-1.905-.632-2.65 0l-.971.83c-.028.026-.116.025-.144.001L8.12 12.01c-.743-.635-1.907-.634-2.657.007L3.5 13.74V9.5h13v5.675zM4.25 3.5h11.5c.414 0 .75.337.75.75V8h-13V4.25c0-.413.336-.75.75-.75M3.5 15.75v-.012l2.944-2.587c.184-.158.518-.157.702 0L9.7 15.328c.586.5 1.503.5 2.09 0l.972-.831c.184-.155.519-.156.694-.008l2.28 2.01H4.25c-.414 0-.75-.337-.75-.75"></path><path fill="var(--iconPrimary, var(--lightningcss-light, rgb(41, 41, 41)) var(--lightningcss-dark, rgb(219, 219, 219)))" d="M5.577 6.5h9c.414 0 .75-.336.75-.75S14.99 5 14.577 5h-9c-.414 0-.75.336-.75.75s.336.75.75.75"></path><circle cx="11.478" cy="11.191" r="1" fill="var(--iconPrimary, var(--lightningcss-light, rgb(41, 41, 41)) var(--lightningcss-dark, rgb(219, 219, 219)))"></circle></svg>,
            content: <Experiences />
         },
        { key: 'templates', title: 'Templates', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" focusable="false" aria-hidden="true" role="img" className="  . _8-3t1x -rwx0fg_e-b"><path fill="var(--iconPrimary, var(--lightningcss-light, rgb(41, 41, 41)) var(--lightningcss-dark, rgb(219, 219, 219)))" d="M14.75 18h-9.5C4.01 18 3 16.99 3 15.75V3.25C3 2.01 4.01 1 5.25 1h9.5C15.99 1 17 2.01 17 3.25v12.5c0 1.24-1.01 2.25-2.25 2.25M5.25 2.5c-.413 0-.75.336-.75.75v12.5c0 .414.337.75.75.75h9.5c.413 0 .75-.336.75-.75V3.25c0-.414-.337-.75-.75-.75z"></path><path fill="var(--iconPrimary, var(--lightningcss-light, rgb(41, 41, 41)) var(--lightningcss-dark, rgb(219, 219, 219)))" d="M9.651 15.267q-.257 0-.512-.108c-.58-.25-.873-.852-.713-1.463l.589-2.218H6.88c-.452 0-.87-.245-1.09-.64-.222-.394-.213-.878.023-1.263l3.468-5.346c.322-.523.956-.728 1.541-.483.582.245.881.844.727 1.457L10.95 7.5h2.17c.461 0 .883.252 1.1.658.22.406.197.897-.057 1.282l-3.48 5.252c-.23.368-.62.575-1.032.575m-.223-1.395-.005.007zM7.34 9.978h2c.39 0 .752.178.99.488.24.31.318.704.218 1.082l-.28 1.054L12.656 9h-2.028c-.39 0-.75-.177-.988-.485-.24-.309-.32-.702-.222-1.079l.287-1.104zM13.12 9h.01zM10.55 5.03l-.005.007z"></path></svg>,
            content: <SWrong />
         },
    ]

    return (
        <div>
            <div className='content-header'>
                <h1 className="page-title">Content</h1>
                <div className="content-header-actions">
                    <button className="content-header-action-btn">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="#fff" xmlns="http://www.w3.org/2000/svg" id="react-aria5257693638-:r1g2:" className="wBx8DG_spectrum-Icon wBx8DG_spectrum-Icon--sizeS ntVziG_spectrum-Icon" focusable="false" aria-hidden="true" role="img"><g clipPath="url(#clip0_5563_242)"><path d="M9.35156 17.2503C9.35156 17.6644 9.01562 18.0003 8.60156 18.0003H2.25C1.00928 18.0003 0 16.9911 0 15.7503V10.2503C0 9.00962 1.00928 8.00034 2.25 8.00034H12.3662C12.7803 8.00034 13.1162 8.33628 13.1162 8.75034C13.1162 9.1644 12.7803 9.50034 12.3662 9.50034H2.25C1.83643 9.50034 1.5 9.83677 1.5 10.2503V14.0877L3.65674 11.931C4.42334 11.1644 5.67139 11.1644 6.43799 11.931L8.86133 14.4774C9.09961 14.7274 9.08936 15.1229 8.83936 15.3607C8.58985 15.5985 8.19288 15.5892 7.95606 15.3387L5.54346 12.8036C5.27442 12.5355 4.82032 12.536 4.54053 12.8148L1.51764 15.8377C1.56287 16.2083 1.86737 16.5003 2.25 16.5003H8.60156C9.01562 16.5003 9.35156 16.8363 9.35156 17.2503ZM5.42187 6.79575C5.81933 6.67905 6.04736 6.26255 5.93066 5.86509C5.90478 5.7772 5.92627 5.65659 6.03271 5.58628L11.0322 2.26987C11.1982 2.15952 11.3979 2.11948 11.5957 2.16001C11.7925 2.20005 11.9614 2.31431 12.0723 2.4813L16.3647 8.96421C16.5093 9.18198 16.7476 9.30015 16.9907 9.30015C17.1333 9.30015 17.2768 9.25962 17.4043 9.17564C17.7495 8.94664 17.8442 8.4813 17.6157 8.13609L13.3232 1.65317C12.9907 1.15171 12.4834 0.809421 11.894 0.689791C11.3052 0.571141 10.7041 0.687351 10.2031 1.01987L5.20361 4.33628C4.56054 4.76304 4.27441 5.54722 4.49121 6.28696C4.60742 6.68442 5.02539 6.91196 5.42187 6.79575ZM9.28552 10.6914C8.7102 10.6914 8.24383 11.1578 8.24383 11.7331C8.24383 12.3083 8.7102 12.7747 9.28552 12.7747C9.86078 12.7747 10.3272 12.3083 10.3272 11.7331C10.3272 11.1578 9.86078 10.6914 9.28552 10.6914Z"></path><path d="M15 10.5C12.5147 10.5 10.5 12.5147 10.5 15C10.5 17.4853 12.5147 19.5 15 19.5C17.4853 19.5 19.5 17.4853 19.5 15C19.5 12.5147 17.4853 10.5 15 10.5ZM17.5 15.625H15.625V17.5C15.625 17.8452 15.3452 18.125 15 18.125C14.6548 18.125 14.375 17.8452 14.375 17.5V15.625H12.5C12.1548 15.625 11.875 15.3452 11.875 15C11.875 14.6548 12.1548 14.375 12.5 14.375H14.375V12.5C14.375 12.1548 14.6548 11.875 15 11.875C15.3452 11.875 15.625 12.1548 15.625 12.5V14.375H17.5C17.8452 14.375 18.125 14.6548 18.125 15C18.125 15.3452 17.8452 15.625 17.5 15.625Z"></path></g><defs><clipPath id="clip0_5563_242"><rect width="20" height="20"></rect></clipPath></defs></svg>
                        <span style={{ marginLeft: "10px" }}>Add Assets</span></button>
                </div>
            </div>

            <Tabs
                defaultActiveKey="assets"
                id="uncontrolled-tab-example"
                className="mb-3"
            >
                {tabs.map(item => (
                    <Tab key={item.key} eventKey={item.key} title={<div style={{display: 'flex', alignItems: 'center', gap: '10px', color:"#000", fontSize:".7em"}}>{item.icon} {item.title}</div>}>
                        <div className="content-tab-content">
                            <div className="content-tab-header">
                                {item.content}
                            </div>
                        </div>
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}

export default Content