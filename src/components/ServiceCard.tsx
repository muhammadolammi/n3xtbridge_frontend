import React from 'react';

interface ServiceProps {
    name: string;
    description: string;
    icon: string;
    image: string;
    tags?: string[];
    isFeatured?: boolean;
}

const ServiceCard: React.FC<ServiceProps> = ({ name: title, description, icon, image, tags, isFeatured }) => {
    return (
        <div className={`${isFeatured ? 'md:col-span-8 flex-col md:flex-row' : 'md:col-span-4 flex-col'} bg-surface-container-lowest rounded-xl p-8 flex gap-8 items-center group transition-all hover:bg-white shadow-sm`}>
            <div className={isFeatured ? 'w-full md:w-1/2 order-2 md:order-1' : 'w-full mt-auto'}>
                <div className="aspect-video rounded-lg overflow-hidden">
                    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            </div>

            <div className={isFeatured ? 'w-full md:w-1/2 order-1 md:order-2' : 'w-full mb-6'}>
                <span className="material-symbols-outlined text-primary text-4xl mb-4">{icon}</span>
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-on-surface-variant mb-6 text-sm">{description}</p>
                <div className="flex gap-2">
                    {tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;